// A small Kubernetes cluster simulator for teaching. It understands Pods, Deployments, Services and
// ConfigMaps (from YAML or kubectl commands), schedules pods onto three nodes by CPU request,
// self-heals Deployments, rolls out new images one pod at a time, and reproduces the common
// failure states (Pending, ImagePullBackOff, CrashLoopBackOff). Time moves in ticks.

import yaml from 'js-yaml';

// Images that "exist" in the pretend registry. A broken build crashes; anything else cannot be pulled.
const IMAGES = new Set(['nginx:1.27', 'nginx:1.29', 'nginx', 'shivam/portfolio:1.5', 'shivam/portfolio:1.6', 'shivam/portfolio:broken', 'redis:7', 'busybox:1.37', 'python:3.13']);
const CRASHING = new Set(['shivam/portfolio:broken']);
const NODE_CPU = 1000; // millicores per node
const DEFAULT_REQUEST = 100;

export class KubeError extends Error {}

const rand = (n) => Math.random().toString(36).slice(2, 2 + n);
const cpuToMilli = (v) => {
  if (v === undefined || v === null || v === '') return DEFAULT_REQUEST;
  const s = String(v);
  if (s.endsWith('m')) return Number(s.slice(0, -1));
  return Math.round(Number(s) * 1000);
};
const matches = (labels = {}, selector = {}) => Object.keys(selector).length > 0 && Object.entries(selector).every(([k, v]) => labels[k] === v);

export function createCluster() {
  return {
    tick: 0,
    nodes: ['node-1', 'node-2', 'node-3'].map((name) => ({ name, cpu: NODE_CPU })),
    pods: [],
    deployments: {},
    services: {},
    configmaps: {},
    events: [],
    rr: {}, // round-robin position per service
  };
}

const event = (c, text) => {
  c.events.push(`${c.tick}: ${text}`);
  if (c.events.length > 60) c.events.shift();
};

// ---------------------------------------------------------------- objects from YAML

function containerSpec(container, where) {
  if (!container?.name) throw new KubeError(`${where}: every container needs a name`);
  if (!container.image) throw new KubeError(`${where}: container "${container.name}" needs an image`);
  return {
    container: container.name, // not "name": that is the pod's own name
    image: String(container.image),
    port: container.ports?.[0]?.containerPort ?? null,
    cpu: cpuToMilli(container.resources?.requests?.cpu),
    memory: container.resources?.requests?.memory ?? null,
    limits: container.resources?.limits ?? null,
    env: (container.env || []).map((e) => ({ name: e.name, value: e.value, from: e.valueFrom?.configMapKeyRef || e.valueFrom?.secretKeyRef || null })),
    envFrom: (container.envFrom || []).map((e) => e.configMapRef?.name || e.secretRef?.name).filter(Boolean),
  };
}

function applyObject(c, obj) {
  if (!obj || typeof obj !== 'object') throw new KubeError('error: the YAML is empty or not an object');
  const { apiVersion, kind, metadata, spec } = obj;
  if (!apiVersion) throw new KubeError('error: apiVersion not set');
  if (!kind) throw new KubeError('error: kind not set');
  const name = metadata?.name;
  if (!name) throw new KubeError(`error: ${kind} has no metadata.name`);
  if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(name)) throw new KubeError(`The ${kind} "${name}" is invalid: metadata.name must be lower-case letters, numbers and dashes`);

  if (kind === 'Pod') {
    if (apiVersion !== 'v1') throw new KubeError(`error: Pods use apiVersion: v1 (got ${apiVersion})`);
    const containers = spec?.containers;
    if (!Array.isArray(containers) || !containers.length) throw new KubeError(`The Pod "${name}" is invalid: spec.containers: Required value`);
    if (c.pods.some((p) => p.name === name)) return `pod/${name} unchanged`;
    const ctr = containerSpec(containers[0], `Pod "${name}"`);
    newPod(c, { name, labels: metadata.labels || {}, owner: null, ...ctr, revision: 0 });
    return `pod/${name} created`;
  }

  if (kind === 'Deployment') {
    if (apiVersion !== 'apps/v1') throw new KubeError(`error: Deployments use apiVersion: apps/v1 (got ${apiVersion})`);
    const selector = spec?.selector?.matchLabels;
    const tlabels = spec?.template?.metadata?.labels;
    const containers = spec?.template?.spec?.containers;
    if (!selector) throw new KubeError(`The Deployment "${name}" is invalid: spec.selector: Required value`);
    if (!tlabels) throw new KubeError(`The Deployment "${name}" is invalid: spec.template.metadata.labels: Required value`);
    if (!matches(tlabels, selector)) throw new KubeError(`The Deployment "${name}" is invalid: spec.template.metadata.labels: Invalid value: ${JSON.stringify(tlabels)}: \`selector\` does not match template \`labels\``);
    if (!Array.isArray(containers) || !containers.length) throw new KubeError(`The Deployment "${name}" is invalid: spec.template.spec.containers: Required value`);
    const replicas = spec.replicas ?? 1;
    if (!Number.isInteger(replicas) || replicas < 0) throw new KubeError(`The Deployment "${name}" is invalid: spec.replicas must be a whole number of 0 or more`);
    const tpl = { labels: tlabels, ...containerSpec(containers[0], `Deployment "${name}"`) };
    const existing = c.deployments[name];
    if (existing) {
      const changed = JSON.stringify(existing.template) !== JSON.stringify(tpl);
      existing.replicas = replicas;
      existing.selector = selector;
      if (changed) {
        existing.history.push(existing.template);
        existing.template = tpl;
        existing.revision++;
        event(c, `deployment/${name}: rolling out revision ${existing.revision} (${tpl.image})`);
      }
      return `deployment.apps/${name} ${changed ? 'configured' : 'unchanged'}`;
    }
    c.deployments[name] = { name, replicas, selector, template: tpl, revision: 1, history: [] };
    event(c, `deployment/${name} created with ${replicas} replica(s)`);
    return `deployment.apps/${name} created`;
  }

  if (kind === 'Service') {
    if (apiVersion !== 'v1') throw new KubeError(`error: Services use apiVersion: v1 (got ${apiVersion})`);
    const port = spec?.ports?.[0];
    if (!port?.port) throw new KubeError(`The Service "${name}" is invalid: spec.ports: Required value`);
    const type = spec.type || 'ClusterIP';
    if (!['ClusterIP', 'NodePort', 'LoadBalancer'].includes(type)) throw new KubeError(`The Service "${name}" is invalid: spec.type: Unsupported value: "${type}"`);
    const nodePort = type === 'ClusterIP' ? null : port.nodePort ?? 30000 + Math.floor(Math.random() * 2767);
    if (nodePort !== null && (nodePort < 30000 || nodePort > 32767)) throw new KubeError(`The Service "${name}" is invalid: nodePort must be in the range 30000-32767`);
    const existed = !!c.services[name];
    c.services[name] = { name, type, selector: spec.selector || {}, port: port.port, targetPort: port.targetPort ?? port.port, nodePort, clusterIP: c.services[name]?.clusterIP || `10.96.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 2}` };
    return `service/${name} ${existed ? 'configured' : 'created'}`;
  }

  if (kind === 'ConfigMap' || kind === 'Secret') {
    if (apiVersion !== 'v1') throw new KubeError(`error: ${kind}s use apiVersion: v1`);
    const existed = !!c.configmaps[name];
    c.configmaps[name] = { name, kind, data: obj.data || obj.stringData || {} };
    return `${kind.toLowerCase()}/${name} ${existed ? 'configured' : 'created'}`;
  }

  throw new KubeError(`error: this practice cluster supports Pod, Deployment, Service, ConfigMap and Secret (got ${kind})`);
}

/** kubectl apply -f: one or more YAML documents separated by --- */
export function applyYaml(c, text) {
  let docs;
  try {
    docs = yaml.loadAll(text).filter(Boolean);
  } catch (e) {
    throw new KubeError(`error: error parsing YAML: ${e.reason || e.message}${e.mark ? ` (line ${e.mark.line + 1})` : ''}`);
  }
  if (!docs.length) throw new KubeError('error: no objects passed to apply');
  return docs.map((d) => applyObject(c, d));
}

// ---------------------------------------------------------------- pods and the control loop

function newPod(c, spec) {
  const pod = {
    ...spec,
    status: 'Pending',
    reason: '',
    node: null,
    restarts: 0,
    born: c.tick,
    phaseAt: c.tick,
  };
  c.pods.push(pod);
  return pod;
}

function nodeFree(c, node) {
  const used = c.pods.filter((p) => p.node === node.name && p.status !== 'Terminating').reduce((s, p) => s + p.cpu, 0);
  return node.cpu - used;
}

function missingConfig(c, pod) {
  for (const ref of pod.envFrom) if (!c.configmaps[ref]) return ref;
  for (const e of pod.env) if (e.from && !c.configmaps[e.from.name]) return e.from.name;
  return null;
}

/** Advance the cluster one step: schedule, start, crash, terminate, reconcile and roll out. */
export function step(c) {
  c.tick++;
  // Pods move through their lifecycle.
  for (const p of c.pods) {
    if (p.status === 'Terminating') {
      if (c.tick - p.phaseAt >= 1) p.gone = true;
      continue;
    }
    if (p.status === 'Pending') {
      const node = c.nodes.filter((n) => nodeFree(c, n) >= p.cpu).sort((a, b) => nodeFree(c, b) - nodeFree(c, a))[0];
      if (!node) {
        if (p.reason !== 'Insufficient cpu') event(c, `pod/${p.name}: 0/3 nodes are available: 3 Insufficient cpu`);
        p.reason = 'Insufficient cpu';
        continue;
      }
      p.node = node.name;
      p.status = 'ContainerCreating';
      p.reason = '';
      p.phaseAt = c.tick;
      continue;
    }
    if (p.status === 'ContainerCreating' && c.tick - p.phaseAt >= 1) {
      const missing = missingConfig(c, p);
      if (missing) {
        p.status = 'CreateContainerConfigError';
        p.reason = `configmap "${missing}" not found`;
      } else if (!IMAGES.has(p.image)) {
        p.status = 'ImagePullBackOff';
        p.reason = `Back-off pulling image "${p.image}"`;
        event(c, `pod/${p.name}: Failed to pull image "${p.image}": not found`);
      } else if (CRASHING.has(p.image)) {
        p.status = 'CrashLoopBackOff';
        p.restarts = 1;
        p.reason = 'Back-off restarting failed container';
      } else p.status = 'Running';
      p.phaseAt = c.tick;
      continue;
    }
    if (p.status === 'CrashLoopBackOff' && c.tick - p.phaseAt >= 2) {
      p.restarts++;
      p.phaseAt = c.tick;
    }
    if (p.status === 'CreateContainerConfigError' && !missingConfig(c, p)) {
      p.status = 'ContainerCreating';
      p.phaseAt = c.tick;
    }
  }
  c.pods = c.pods.filter((p) => !p.gone);

  // Each Deployment keeps `replicas` pods of its current template, replacing old ones one at a time.
  for (const d of Object.values(c.deployments)) {
    const mine = c.pods.filter((p) => p.owner === d.name && p.status !== 'Terminating');
    const current = mine.filter((p) => p.revision === d.revision);
    const old = mine.filter((p) => p.revision !== d.revision);
    const readyCurrent = current.filter((p) => p.status === 'Running');
    if (current.length < d.replicas && mine.length < d.replicas + 1) {
      const id = `${d.name}-${rand(5)}${rand(5)}`.slice(0, d.name.length + 11);
      newPod(c, { name: id, labels: { ...d.template.labels }, owner: d.name, revision: d.revision, ...d.template });
      if (!old.length) event(c, `deployment/${d.name}: created pod ${id}`);
    }
    // Retire an old pod only once a new one is Running (maxUnavailable 0, maxSurge 1).
    if (old.length && readyCurrent.length + old.length > d.replicas) terminate(c, old[0]);
    else if (!old.length && current.length > d.replicas) terminate(c, current[current.length - 1]); // scaled down
    if (old.length && readyCurrent.length >= d.replicas) old.forEach((p) => terminate(c, p));
  }
}

function terminate(c, pod) {
  if (pod.status === 'Terminating') return;
  pod.status = 'Terminating';
  pod.phaseAt = c.tick;
}

/** Run enough ticks for things to settle (used by exercise checks). */
export function settle(c, ticks = 40) {
  for (let i = 0; i < ticks; i++) step(c);
  return c;
}

export const endpoints = (c, svc) => c.pods.filter((p) => p.status === 'Running' && matches(p.labels, svc.selector));

/** Send one request to a Service: which pod answers (round robin), or why nothing does. */
export function request(c, name) {
  const svc = c.services[name];
  if (!svc) return { error: `service "${name}" not found` };
  const eps = endpoints(c, svc);
  if (!eps.length) return { error: `no endpoints: no Running pod has labels ${JSON.stringify(svc.selector)}` };
  const i = (c.rr[name] || 0) % eps.length;
  c.rr[name] = i + 1;
  const pod = eps[i];
  if (pod.port && svc.targetPort !== pod.port) return { error: `connection refused: the Service sends to port ${svc.targetPort} but the container listens on ${pod.port}` };
  return { pod };
}

// ---------------------------------------------------------------- kubectl

const age = (c, p) => `${(c.tick - p.born) * 5}s`;
const pad = (rows) => {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  return rows.map((r) => r.map((cell, i) => String(cell).padEnd(widths[i] + 3)).join('').trimEnd()).join('\n');
};
const ready = (c, d) => c.pods.filter((p) => p.owner === d.name && p.status === 'Running' && p.revision === d.revision).length;

function getPods(c, wide, selector) {
  let pods = c.pods;
  if (selector) {
    const [k, v] = selector.split('=');
    pods = pods.filter((p) => p.labels[k] === v);
  }
  if (!pods.length) return 'No resources found in default namespace.';
  const head = ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE'].concat(wide ? ['NODE', 'IMAGE'] : []);
  return pad([head, ...pods.map((p) => [p.name, p.status === 'Running' ? '1/1' : '0/1', p.status, p.restarts, age(c, p)].concat(wide ? [p.node || '<none>', p.image] : []))]);
}

const HELP = `Commands you can use here:
  kubectl get pods [-o wide] [-l app=web]     kubectl get deployments | services | nodes | endpoints | configmaps | all
  kubectl describe pod|deployment|service NAME
  kubectl apply -f manifest.yaml              (applies the YAML in the editor)
  kubectl create deployment NAME --image=IMAGE [--replicas=N]
  kubectl scale deployment NAME --replicas=N
  kubectl set image deployment/NAME CONTAINER=IMAGE
  kubectl rollout status|history|undo deployment/NAME
  kubectl expose deployment NAME --port=80 [--target-port=8080] [--type=NodePort]
  kubectl delete pod|deployment|service NAME
  kubectl logs POD
  clear`;

/** Run one kubectl command line. `manifest` is the YAML editor's text, for apply -f. Returns the output text. */
export function kubectl(c, line, manifest = '') {
  const parts = line.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts[0] === 'help' || parts[0] === '--help') return HELP;
  if (parts[0] !== 'kubectl' && parts[0] !== 'k') throw new KubeError(`${parts[0]}: command not found (commands start with kubectl; try "help")`);
  const [verb, ...rest] = parts.slice(1);
  const flag = (n) => {
    const hit = rest.find((r) => r.startsWith(`--${n}=`));
    return hit ? hit.slice(n.length + 3) : null;
  };
  const words = rest.filter((r) => !r.startsWith('-'));
  const target = (w) => {
    // "deployment/web" or "deployment web"
    if (w[0]?.includes('/')) return w[0].split('/');
    return [w[0], w[1]];
  };
  const kindOf = (k = '') => {
    k = k.toLowerCase();
    if (['po', 'pod', 'pods'].includes(k)) return 'pod';
    if (['deploy', 'deployment', 'deployments'].includes(k)) return 'deployment';
    if (['svc', 'service', 'services'].includes(k)) return 'service';
    if (['no', 'node', 'nodes'].includes(k)) return 'node';
    if (['ep', 'endpoints'].includes(k)) return 'endpoints';
    if (['cm', 'configmap', 'configmaps', 'secret', 'secrets'].includes(k)) return 'configmap';
    if (k === 'all') return 'all';
    throw new KubeError(`error: the server doesn't have a resource type "${k}"`);
  };

  switch (verb) {
    case undefined:
      return HELP;
    case 'version':
      return 'Client Version: v1.36.2\nServer Version: v1.36.2 (practice cluster)';
    case 'get': {
      const kind = kindOf(words[0]);
      const wide = rest.includes('wide') || rest.includes('-owide');
      const li = rest.indexOf('-l');
      const selector = li >= 0 ? rest[li + 1] : flag('selector');
      if (kind === 'pod') return getPods(c, wide, selector);
      if (kind === 'deployment') {
        const ds = Object.values(c.deployments);
        if (!ds.length) return 'No resources found in default namespace.';
        return pad([['NAME', 'READY', 'UP-TO-DATE', 'AVAILABLE'], ...ds.map((d) => [d.name, `${ready(c, d)}/${d.replicas}`, c.pods.filter((p) => p.owner === d.name && p.revision === d.revision && p.status !== 'Terminating').length, ready(c, d)])]);
      }
      if (kind === 'service') {
        const ss = Object.values(c.services);
        return pad([['NAME', 'TYPE', 'CLUSTER-IP', 'PORT(S)'], ['kubernetes', 'ClusterIP', '10.96.0.1', '443/TCP'], ...ss.map((s) => [s.name, s.type, s.clusterIP, `${s.port}${s.nodePort ? `:${s.nodePort}` : ''}/TCP`])]);
      }
      if (kind === 'node') return pad([['NAME', 'STATUS', 'ROLES', 'VERSION', 'CPU FREE'], ...c.nodes.map((n) => [n.name, 'Ready', '<none>', 'v1.36.2', `${nodeFree(c, n)}m`])]);
      if (kind === 'endpoints') {
        const ss = Object.values(c.services);
        if (!ss.length) return 'No resources found in default namespace.';
        return pad([['NAME', 'ENDPOINTS'], ...ss.map((s) => [s.name, endpoints(c, s).map((p) => `${p.name}:${s.targetPort}`).join(',') || '<none>'])]);
      }
      if (kind === 'configmap') {
        const cms = Object.values(c.configmaps);
        if (!cms.length) return 'No resources found in default namespace.';
        return pad([['NAME', 'KIND', 'DATA'], ...cms.map((m) => [m.name, m.kind, Object.keys(m.data).length])]);
      }
      return [getPods(c, false), kubectl(c, 'kubectl get deployments'), kubectl(c, 'kubectl get services')].join('\n\n');
    }
    case 'describe': {
      const [k, name] = target(words);
      const kind = kindOf(k);
      if (kind === 'pod') {
        const p = c.pods.find((x) => x.name === name);
        if (!p) throw new KubeError(`Error from server (NotFound): pods "${name}" not found`);
        return [`Name:         ${p.name}`, `Node:         ${p.node || '<none>'}`, `Labels:       ${Object.entries(p.labels).map(([a, b]) => `${a}=${b}`).join(', ') || '<none>'}`, `Status:       ${p.status}`, `Image:        ${p.image}`, `Requests:     cpu ${p.cpu}m${p.memory ? `, memory ${p.memory}` : ''}`, `Restarts:     ${p.restarts}`, `Controlled By: ${p.owner ? `ReplicaSet/${p.owner} (Deployment ${p.owner})` : '<none> (a bare Pod: nothing will recreate it)'}`, p.reason ? `Reason:       ${p.reason}` : null].filter(Boolean).join('\n');
      }
      if (kind === 'deployment') {
        const d = c.deployments[name];
        if (!d) throw new KubeError(`Error from server (NotFound): deployments.apps "${name}" not found`);
        return [`Name:        ${d.name}`, `Selector:    ${Object.entries(d.selector).map(([a, b]) => `${a}=${b}`).join(',')}`, `Replicas:    ${d.replicas} desired | ${ready(c, d)} ready`, `Image:       ${d.template.image}`, `Revision:    ${d.revision}`, `Strategy:    RollingUpdate (max surge 1, max unavailable 0)`].join('\n');
      }
      if (kind === 'service') {
        const s = c.services[name];
        if (!s) throw new KubeError(`Error from server (NotFound): services "${name}" not found`);
        return [`Name:        ${s.name}`, `Type:        ${s.type}`, `Selector:    ${Object.entries(s.selector).map(([a, b]) => `${a}=${b}`).join(',') || '<none>'}`, `Port:        ${s.port} → targetPort ${s.targetPort}${s.nodePort ? ` (NodePort ${s.nodePort})` : ''}`, `Endpoints:   ${endpoints(c, s).map((p) => p.name).join(', ') || '<none>'}`].join('\n');
      }
      throw new KubeError('error: describe supports pod, deployment and service here');
    }
    case 'apply': {
      if (!rest.includes('-f') && !flag('filename')) throw new KubeError('error: must specify -f (the YAML in the editor)');
      return applyYaml(c, manifest).join('\n');
    }
    case 'create': {
      if (words[0] !== 'deployment') throw new KubeError('error: here, create supports "create deployment NAME --image=IMAGE"');
      const name = words[1];
      const image = flag('image');
      if (!name || !image) throw new KubeError('error: required: kubectl create deployment NAME --image=IMAGE');
      if (c.deployments[name]) throw new KubeError(`Error from server (AlreadyExists): deployments.apps "${name}" already exists`);
      const replicas = Number(flag('replicas') || 1);
      return applyObject(c, { apiVersion: 'apps/v1', kind: 'Deployment', metadata: { name }, spec: { replicas, selector: { matchLabels: { app: name } }, template: { metadata: { labels: { app: name } }, spec: { containers: [{ name: image.split(/[/:]/).slice(-2, -1)[0] || name, image }] } } } });
    }
    case 'scale': {
      const [k, name] = target(words);
      if (kindOf(k) !== 'deployment') throw new KubeError('error: scale works on deployments here');
      const d = c.deployments[name];
      if (!d) throw new KubeError(`Error from server (NotFound): deployments.apps "${name}" not found`);
      const n = Number(flag('replicas'));
      if (!Number.isInteger(n) || n < 0) throw new KubeError('error: --replicas=COUNT is required (a whole number)');
      d.replicas = n;
      event(c, `deployment/${name} scaled to ${n}`);
      return `deployment.apps/${name} scaled`;
    }
    case 'set': {
      if (words[0] !== 'image') throw new KubeError('error: try "kubectl set image deployment/NAME CONTAINER=IMAGE"');
      const [k, name] = target(words.slice(1));
      const assign = words.find((w) => w.includes('='));
      if (kindOf(k) !== 'deployment' || !assign) throw new KubeError('error: usage: kubectl set image deployment/NAME CONTAINER=IMAGE');
      const d = c.deployments[name];
      if (!d) throw new KubeError(`Error from server (NotFound): deployments.apps "${name}" not found`);
      const [container, image] = assign.split('=');
      if (container !== d.template.container) throw new KubeError(`error: unable to find container named "${container}" (the container is called "${d.template.container}")`);
      if (image === d.template.image) return `deployment.apps/${name} image unchanged`;
      d.history.push(d.template);
      d.template = { ...d.template, image };
      d.revision++;
      event(c, `deployment/${name}: rolling out revision ${d.revision} (${image})`);
      return `deployment.apps/${name} image updated`;
    }
    case 'rollout': {
      const sub = words[0];
      const [k, name] = target(words.slice(1));
      if (kindOf(k) !== 'deployment') throw new KubeError('error: rollout works on deployments here');
      const d = c.deployments[name];
      if (!d) throw new KubeError(`Error from server (NotFound): deployments.apps "${name}" not found`);
      if (sub === 'status') {
        const r = ready(c, d);
        const stuck = c.pods.some((p) => p.owner === name && p.revision === d.revision && ['ImagePullBackOff', 'CrashLoopBackOff', 'CreateContainerConfigError'].includes(p.status));
        if (stuck) return `Waiting for deployment "${name}" rollout to finish: new pods are failing (${c.pods.find((p) => p.owner === name && p.revision === d.revision && p.status !== 'Running')?.status}). Fix the image or run: kubectl rollout undo deployment/${name}`;
        return r >= d.replicas && !c.pods.some((p) => p.owner === name && p.revision !== d.revision) ? `deployment "${name}" successfully rolled out` : `Waiting for deployment "${name}" rollout to finish: ${r} of ${d.replicas} updated replicas are available...`;
      }
      if (sub === 'history') return ['REVISION  IMAGE', ...d.history.map((t, i) => `${String(i + 1).padEnd(10)}${t.image}`), `${String(d.revision).padEnd(10)}${d.template.image}   (current)`].join('\n');
      if (sub === 'undo') {
        const prev = d.history.pop();
        if (!prev) throw new KubeError(`error: no rollout history found for deployment "${name}"`);
        d.template = prev;
        d.revision++;
        event(c, `deployment/${name}: rolled back to ${prev.image}`);
        return `deployment.apps/${name} rolled back`;
      }
      throw new KubeError('error: use rollout status | history | undo');
    }
    case 'expose': {
      const [k, name] = target(words);
      if (kindOf(k) !== 'deployment') throw new KubeError('error: expose works on deployments here');
      const d = c.deployments[name];
      if (!d) throw new KubeError(`Error from server (NotFound): deployments.apps "${name}" not found`);
      const port = Number(flag('port'));
      if (!port) throw new KubeError('error: --port is required');
      return applyObject(c, { apiVersion: 'v1', kind: 'Service', metadata: { name }, spec: { type: flag('type') || 'ClusterIP', selector: d.selector, ports: [{ port, targetPort: Number(flag('target-port') || port) }] } });
    }
    case 'delete': {
      const [k, name] = target(words);
      const kind = kindOf(k);
      if (kind === 'pod') {
        const p = c.pods.find((x) => x.name === name);
        if (!p) throw new KubeError(`Error from server (NotFound): pods "${name}" not found`);
        terminate(c, p);
        event(c, `pod/${name} deleted`);
        return `pod "${name}" deleted`;
      }
      if (kind === 'deployment') {
        if (!c.deployments[name]) throw new KubeError(`Error from server (NotFound): deployments.apps "${name}" not found`);
        delete c.deployments[name];
        c.pods.filter((p) => p.owner === name).forEach((p) => terminate(c, p));
        return `deployment.apps "${name}" deleted`;
      }
      if (kind === 'service') {
        if (!c.services[name]) throw new KubeError(`Error from server (NotFound): services "${name}" not found`);
        delete c.services[name];
        return `service "${name}" deleted`;
      }
      throw new KubeError('error: delete supports pod, deployment and service here');
    }
    case 'logs': {
      const p = c.pods.find((x) => x.name === words[0]);
      if (!p) throw new KubeError(`Error from server (NotFound): pods "${words[0]}" not found`);
      if (p.status === 'CrashLoopBackOff') return 'Starting portfolio server...\nError: cannot read config: PORTFOLIO_MODE is not set\nexit code 1';
      if (p.status !== 'Running') return `Error from server (BadRequest): container is waiting to start: ${p.status}`;
      if (p.image.startsWith('nginx')) return '/docker-entrypoint.sh: Configuration complete; ready for start up\nGET / 200 (from 10.244.0.1)';
      return `Server listening on port ${p.port || 8080}\nGET /learn.html 200`;
    }
    default:
      throw new KubeError(`error: unknown command "${verb}" for "kubectl" (try "help")`);
  }
}
