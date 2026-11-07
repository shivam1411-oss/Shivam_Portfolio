import { code } from './util';

export const k8sKb = {
  intro: 'Kubernetes from "what is a container?" to security, scheduling and GitOps. Examples cover web shops, APIs, databases, batch jobs and streaming. Where you see a practice cluster, type real kubectl commands.',
  topics: [
    // ------------------------------------------------------------ beginner
    {
      id: 'containers',
      level: 'beginner',
      title: 'Containers: why "it works on my machine" stopped being a problem',
      summary: 'A container packages an app with everything it needs (runtime, libraries, settings) so it runs the same on a laptop, a test server or the cloud.',
      body: [
        'An **image** is the package: a read-only snapshot built from a recipe called a **Dockerfile**. A **container** is a running copy of an image. Unlike a virtual machine, containers share the host\'s operating-system kernel, so they start in seconds and are small.',
        'Images are stored in **registries** (Docker Hub, GitHub Container Registry, cloud registries) and named like `nginx:1.27`, where the part after the colon is the **tag** (version).',
      ],
      code: code`
        # Dockerfile for a small Python web API
        FROM python:3.13-slim
        WORKDIR /app
        COPY requirements.txt .
        RUN pip install --no-cache-dir -r requirements.txt
        COPY . .
        EXPOSE 8000
        CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

        # Build, run, publish
        docker build -t acme/menu-api:1.0 .
        docker run -p 8000:8000 acme/menu-api:1.0
        docker push acme/menu-api:1.0
      `,
      lang: 'bash',
      points: ['Image = package; container = running copy.', 'Containers share the host kernel, so they are light.', 'Tags name versions: app:1.0.'],
      realWorld: 'A restaurant-ordering start-up runs the exact same menu-API image on every developer laptop and in production.',
      check: { q: 'What is the difference between an image and a container?', options: ['None', 'An image is the package; a container is a running instance of it', 'A container is bigger', 'Images run, containers are stored'], answer: 1, why: 'Like a recipe vs a cooked dish.' },
      lesson: 'k-intro',
    },
    {
      id: 'what-k8s-does',
      level: 'beginner',
      title: 'What Kubernetes does',
      summary: 'Kubernetes runs containers across many machines and keeps them in the state you describe: the right number running, healthy, reachable and up to date.',
      body: [
        'Running one container is easy. Running hundreds across many servers, restarting crashed ones, spreading load and updating without downtime is hard. Kubernetes (often "K8s") automates this. It was created at Google and is now maintained by the Cloud Native Computing Foundation.',
        'You describe the **desired state** ("3 copies of menu-api version 1.0"). Kubernetes\' **control loops** constantly compare it with the actual state and fix differences. A **cluster** has a **control plane** (the brain) and **worker nodes** (machines that run containers).',
      ],
      code: code`
        Desired state:  3 × menu-api:1.0
        Actual state:   2 running (one node crashed)
        Control loop:   difference = 1  →  start 1 new pod on a healthy node
        Actual state:   3 running ✓
      `,
      lang: 'text',
      points: ['You declare what you want; Kubernetes makes it so.', 'Control plane decides; nodes run.', 'Self-healing, scaling and rollouts are built in.'],
      realWorld: 'During a festival sale, an online shop scales from 10 to 200 copies of its checkout service automatically.',
      check: { q: 'What does "declarative" mean in Kubernetes?', options: ['You type every step', 'You describe the desired result and Kubernetes works out the steps', 'You write Java', 'It only runs once'], answer: 1, why: 'Kubernetes reconciles towards what you declared.' },
      lesson: 'k-intro',
    },
    {
      id: 'pods',
      level: 'beginner',
      title: 'Pods: the smallest unit',
      summary: 'Kubernetes does not run containers directly; it runs pods. A pod wraps one (sometimes a few) containers that share an IP address and storage.',
      body: [
        'Most pods have one container. Extra **sidecar** containers help the main one, such as a log shipper. Pods are **disposable**: when one dies, it is replaced by a new pod with a new name and IP, never repaired.',
        'Try it: the manifest is loaded in the practice cluster. Run `kubectl apply -f manifest.yaml`, then `kubectl get pods` a few times to watch it go from Pending to ContainerCreating to Running.',
      ],
      code: code`
        apiVersion: v1
        kind: Pod
        metadata:
          name: web
          labels:
            app: web
        spec:
          containers:
            - name: nginx
              image: nginx:1.27
              ports:
                - containerPort: 80
      `,
      lang: 'yaml',
      run: true,
      suggestions: ['kubectl apply -f manifest.yaml', 'kubectl get pods -o wide', 'kubectl describe pod web', 'kubectl logs web'],
      points: ['Pods wrap containers that share network and storage.', 'Pods are replaced, not repaired.', 'Lifecycle: Pending → ContainerCreating → Running.'],
      realWorld: 'A news site\'s web pod runs an nginx container plus a sidecar that ships access logs to analytics.',
      check: { q: 'A bare pod (no Deployment) is deleted. What happens?', options: ['It comes back automatically', 'It is gone until you create it again', 'The node restarts', 'Kubernetes creates two'], answer: 1, why: 'Only controllers like Deployments recreate pods.' },
      lesson: 'k-pods',
    },
    {
      id: 'kubectl',
      level: 'beginner',
      title: 'kubectl essentials',
      summary: 'kubectl is the command-line tool for talking to a cluster. Five verbs cover most days: get, describe, logs, apply and delete.',
      body: [
        '`kubectl get pods` lists things (add `-o wide` for nodes and IPs, `-l app=web` to filter by label). `kubectl describe pod NAME` shows details and **events**, the first place to look when something is wrong. `kubectl logs NAME` prints the app\'s output.',
        '`kubectl apply -f file.yaml` creates or updates objects from a file; `kubectl delete` removes them. This practice cluster already runs a Deployment; try the suggested commands.',
      ],
      code: code`
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: shop
        spec:
          replicas: 3
          selector:
            matchLabels:
              app: shop
          template:
            metadata:
              labels:
                app: shop
            spec:
              containers:
                - name: web
                  image: nginx:1.27
      `,
      lang: 'yaml',
      run: true,
      setup: true,
      suggestions: ['kubectl get pods', 'kubectl get pods -o wide', 'kubectl get deploy', 'kubectl get nodes', 'kubectl describe deployment shop'],
      points: ['get lists; describe explains; logs shows output.', 'apply -f creates or updates from YAML.', 'Events in describe explain most problems.'],
      realWorld: 'On-call engineers start every incident with kubectl get pods and kubectl describe on anything not Running.',
      check: { q: 'A pod is stuck in Pending. Which command shows why?', options: ['kubectl logs', 'kubectl describe pod NAME', 'kubectl delete', 'kubectl version'], answer: 1, why: 'Its events explain scheduling problems.' },
      lesson: 'k-pods',
    },
    {
      id: 'yaml-anatomy',
      level: 'beginner',
      title: 'Reading a Kubernetes YAML file',
      summary: 'Every object has the same four parts: apiVersion, kind, metadata and spec. Labels in metadata are how objects find each other.',
      body: [
        '**apiVersion** + **kind** say what you are creating (`v1` Pod, `apps/v1` Deployment). **metadata** holds the name, namespace and **labels** (key: value tags). **spec** is the desired state, different for each kind. Kubernetes adds a **status** section with the actual state.',
        'YAML rules: indentation with spaces only (2 per level), `key: value` pairs, `- ` for list items, and `---` to separate several objects in one file.',
      ],
      code: code`
        apiVersion: v1              # API group/version
        kind: ConfigMap             # what to create
        metadata:
          name: shop-settings       # unique within the namespace
          labels:
            app: shop               # tags used by selectors
            team: checkout
        data:                       # ConfigMaps use data instead of spec
          CURRENCY: INR
          FREE_DELIVERY_ABOVE: "499"
        ---
        apiVersion: v1
        kind: Pod
        metadata:
          name: settings-reader
        spec:
          containers:
            - name: app
              image: busybox:1.37
              envFrom:
                - configMapRef:
                    name: shop-settings
      `,
      lang: 'yaml',
      run: true,
      suggestions: ['kubectl apply -f manifest.yaml', 'kubectl get configmaps', 'kubectl describe pod settings-reader'],
      points: ['apiVersion, kind, metadata, spec.', 'Labels connect objects.', 'Spaces only; --- separates documents.'],
      realWorld: 'Platform teams review YAML in pull requests just like code, catching mistakes before they reach production.',
      check: { q: 'Which section holds the desired state of a Deployment?', options: ['metadata', 'spec', 'status', 'kind'], answer: 1, why: 'spec is what you want; status is what is.' },
      lesson: 'k-pods',
    },
    // ------------------------------------------------------------ intermediate
    {
      id: 'deployments',
      level: 'intermediate',
      title: 'Deployments, ReplicaSets and scaling',
      summary: 'A Deployment keeps a set number of identical pods running and manages updates. Under the hood it uses a ReplicaSet per version.',
      body: [
        'The Deployment\'s `selector.matchLabels` must match the pod template\'s labels. Its **ReplicaSet** creates or deletes pods until the count matches `replicas`. Delete a pod and a replacement appears within seconds.',
        'Scale with `kubectl scale deployment NAME --replicas=5` or by editing the YAML and applying it again. Try it in the practice cluster, then delete a pod and watch it heal.',
      ],
      code: code`
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: menu-api
        spec:
          replicas: 2
          selector:
            matchLabels:
              app: menu-api
          template:
            metadata:
              labels:
                app: menu-api
            spec:
              containers:
                - name: api
                  image: python:3.13
      `,
      lang: 'yaml',
      run: true,
      suggestions: ['kubectl apply -f manifest.yaml', 'kubectl get pods', 'kubectl scale deployment menu-api --replicas=5', 'kubectl get deploy'],
      points: ['Deployment → ReplicaSet → Pods.', 'Selector labels must match template labels.', 'Scale with kubectl scale or replicas:.'],
      realWorld: 'A food-delivery API runs 4 replicas at night and 40 at lunchtime.',
      check: { q: 'What recreates a deleted pod that belongs to a Deployment?', options: ['The kubelet alone', 'The Deployment\'s ReplicaSet controller', 'kubectl', 'Nobody'], answer: 1, why: 'It reconciles the pod count back to replicas.' },
      lesson: 'k-deploy',
    },
    {
      id: 'services',
      level: 'intermediate',
      title: 'Services and DNS',
      summary: 'Pods come and go with new IPs. A Service gives them one stable name and IP and load-balances across every ready pod matching its selector.',
      body: [
        '**ClusterIP** (default) is reachable inside the cluster; **NodePort** opens a port (30000–32767) on every node; **LoadBalancer** asks the cloud for an external load balancer. `port` is the Service\'s port; `targetPort` is the container\'s.',
        'Cluster DNS lets pods call a Service by name: `http://menu-api` in the same namespace, or `menu-api.food.svc.cluster.local` across namespaces. Apply the manifest, then use the request buttons to see round-robin load balancing.',
      ],
      code: code`
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: menu-api
        spec:
          replicas: 3
          selector:
            matchLabels:
              app: menu-api
          template:
            metadata:
              labels:
                app: menu-api
            spec:
              containers:
                - name: api
                  image: nginx:1.27
                  ports:
                    - containerPort: 80
        ---
        apiVersion: v1
        kind: Service
        metadata:
          name: menu-api
        spec:
          selector:
            app: menu-api
          ports:
            - port: 80
              targetPort: 80
      `,
      lang: 'yaml',
      run: true,
      suggestions: ['kubectl apply -f manifest.yaml', 'kubectl get svc', 'kubectl get endpoints'],
      points: ['Services give pods a stable address.', 'Selector picks pods; endpoints are the ready matches.', 'ClusterIP, NodePort, LoadBalancer.'],
      realWorld: 'A mobile app\'s backend calls http://payments inside the cluster no matter how many payment pods exist.',
      check: { q: 'kubectl get endpoints shows <none> for a Service. Most likely cause?', options: ['DNS is down', 'Its selector matches no running pods', 'Too many pods', 'Wrong apiVersion'], answer: 1, why: 'No matching ready pods means no endpoints.' },
      lesson: 'k-services',
    },
    {
      id: 'config-secrets',
      level: 'intermediate',
      title: 'ConfigMaps and Secrets',
      summary: 'Keep configuration out of images: ConfigMaps for settings, Secrets for passwords and keys. Inject them as environment variables or files.',
      body: [
        'The same image should run in test and production with different settings. **ConfigMaps** hold plain settings; **Secrets** hold sensitive values (base64-encoded by default, which is not encryption, so restrict access and enable encryption at rest).',
        'Load all keys with `envFrom`, single keys with `env.valueFrom`, or mount them as files. A pod that references a missing ConfigMap shows `CreateContainerConfigError`. Try applying the manifest, then deleting the ConfigMap section to see it.',
      ],
      code: code`
        apiVersion: v1
        kind: ConfigMap
        metadata:
          name: weather-config
        data:
          CITY: Bengaluru
          UNITS: metric
        ---
        apiVersion: v1
        kind: Secret
        metadata:
          name: weather-secret
        stringData:
          API_KEY: replace-me
        ---
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: weather
        spec:
          replicas: 2
          selector:
            matchLabels:
              app: weather
          template:
            metadata:
              labels:
                app: weather
            spec:
              containers:
                - name: app
                  image: python:3.13
                  envFrom:
                    - configMapRef:
                        name: weather-config
                  env:
                    - name: API_KEY
                      valueFrom:
                        secretKeyRef:
                          name: weather-secret
                          key: API_KEY
      `,
      lang: 'yaml',
      run: true,
      suggestions: ['kubectl apply -f manifest.yaml', 'kubectl get pods', 'kubectl get configmaps'],
      points: ['ConfigMaps for settings, Secrets for credentials.', 'base64 is encoding, not encryption.', 'envFrom loads every key.'],
      realWorld: 'A weather app uses one image everywhere, with different API keys in each environment\'s Secret.',
      check: { q: 'Are Kubernetes Secrets encrypted by default just because they are base64?', options: ['Yes', 'No, base64 is only encoding; enable encryption at rest and restrict access', 'Only in YAML', 'Only on Tuesdays'], answer: 1, why: 'Anyone can decode base64.' },
      lesson: 'k-config',
    },
    {
      id: 'namespaces-resources',
      level: 'intermediate',
      title: 'Namespaces, requests and limits',
      summary: 'Namespaces divide a cluster between teams or environments. Requests reserve CPU and memory for scheduling; limits cap usage.',
      body: [
        '**Namespaces** (`dev`, `prod`, `team-payments`) group objects, scope names and carry quotas and permissions. `kubectl get pods -n prod` looks in one namespace.',
        '**Requests** tell the scheduler how much a container needs; a pod waits in Pending if no node has room (`Insufficient cpu`). **Limits** cap usage: CPU is throttled, memory over the limit gets the container killed (`OOMKilled`). CPU is measured in millicores: `250m` is a quarter of a core. Each node in this practice cluster has 1000m.',
      ],
      code: code`
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: video-encoder
        spec:
          replicas: 4
          selector:
            matchLabels:
              app: video-encoder
          template:
            metadata:
              labels:
                app: video-encoder
            spec:
              containers:
                - name: encoder
                  image: python:3.13
                  resources:
                    requests:
                      cpu: 700m
                      memory: 512Mi
                    limits:
                      cpu: "1"
                      memory: 1Gi
      `,
      lang: 'yaml',
      run: true,
      suggestions: ['kubectl apply -f manifest.yaml', 'kubectl get pods', 'kubectl get nodes', 'kubectl scale deployment video-encoder --replicas=3'],
      points: ['Namespaces separate teams and environments.', 'Requests decide placement; limits cap usage.', '1000m = 1 CPU core.'],
      realWorld: 'A video platform sets high CPU requests on encoders so they never share a node with latency-sensitive APIs.',
      check: { q: '4 pods each request 700m CPU on 3 nodes of 1000m. What happens?', options: ['All run', '3 run, 1 stays Pending', 'All fail', 'Kubernetes adds a node automatically'], answer: 1, why: 'Only one 700m pod fits per node.' },
      lesson: 'k-config',
    },
    {
      id: 'probes',
      level: 'intermediate',
      title: 'Health checks: liveness, readiness and startup probes',
      summary: 'Probes tell Kubernetes when a container is ready for traffic and when it is stuck and should be restarted.',
      body: [
        'A **readiness probe** decides whether a pod receives traffic from Services; failing pods are removed from endpoints but not restarted. A **liveness probe** restarts a container that has hung. A **startup probe** gives slow-starting apps time before liveness checks begin.',
        'Probes can be HTTP GETs, TCP connections or commands. Make readiness check dependencies the app truly needs, keep liveness simple (is the process responsive?), and never point liveness at a shared database, or one outage restarts everything.',
      ],
      code: code`
        containers:
          - name: api
            image: acme/orders-api:2.3
            ports:
              - containerPort: 8080
            startupProbe:
              httpGet: { path: /healthz, port: 8080 }
              failureThreshold: 30
              periodSeconds: 2          # up to 60 s to start
            readinessProbe:
              httpGet: { path: /ready, port: 8080 }
              periodSeconds: 5
            livenessProbe:
              httpGet: { path: /healthz, port: 8080 }
              periodSeconds: 10
              failureThreshold: 3
      `,
      lang: 'yaml',
      points: ['Readiness controls traffic; liveness restarts.', 'Startup probes protect slow starters.', 'Do not make liveness depend on shared services.'],
      realWorld: 'An orders API stops receiving traffic while warming its cache, thanks to a readiness probe, so customers never hit a cold pod.',
      check: { q: 'A failing readiness probe causes…', options: ['A restart', 'The pod to be removed from Service endpoints until it passes', 'The node to drain', 'Nothing'], answer: 1, why: 'Readiness is about traffic, not restarts.' },
      lesson: 'k-rollout',
    },
    // ------------------------------------------------------------ advanced
    {
      id: 'ingress-gateway',
      level: 'advanced',
      title: 'Ingress and the Gateway API',
      summary: 'One entry point routes outside HTTP traffic to many Services by host name and path, and terminates TLS (HTTPS).',
      body: [
        'Instead of one cloud load balancer per Service, an **Ingress controller** (such as NGINX or Traefik) or a **Gateway** handles all incoming traffic: `shop.example.com/` to the web Service, `/api` to the API Service. Certificates can be automated with cert-manager and Let\'s Encrypt.',
        'The **Gateway API** is the newer, more expressive standard: infrastructure teams own the `Gateway`, application teams own `HTTPRoute`s, and it supports traffic splitting for canary releases.',
      ],
      code: code`
        apiVersion: gateway.networking.k8s.io/v1
        kind: HTTPRoute
        metadata:
          name: shop
        spec:
          parentRefs:
            - name: public-gateway
          hostnames: ["shop.example.com"]
          rules:
            - matches:
                - path: { type: PathPrefix, value: /api }
              backendRefs:
                - name: orders-api
                  port: 80
                  weight: 90
                - name: orders-api-v2     # canary: 10% of traffic
                  port: 80
                  weight: 10
            - backendRefs:
                - name: web
                  port: 80
      `,
      lang: 'yaml',
      points: ['One entry point, many Services.', 'TLS terminates at the edge.', 'Gateway API adds roles and traffic splitting.'],
      realWorld: 'An online store sends 10% of API traffic to a new version with an HTTPRoute before a full rollout.',
      check: { q: 'Main benefit of Ingress/Gateway over one LoadBalancer per Service?', options: ['Faster CPUs', 'One entry point routing by host and path, with shared TLS', 'Free storage', 'No YAML'], answer: 1, why: 'It consolidates and routes HTTP traffic.' },
    },
    {
      id: 'storage',
      level: 'advanced',
      title: 'Storage and StatefulSets',
      summary: 'Container files vanish when a pod is replaced. PersistentVolumeClaims request durable storage, and StatefulSets give each replica a stable name and its own disk.',
      body: [
        'A **PersistentVolumeClaim (PVC)** asks for storage (size, access mode); a **StorageClass** provisions it dynamically from the cloud (EBS, Persistent Disk, Azure Disk). The pod mounts the claim as a folder.',
        '**StatefulSets** run databases and queues: pods get stable names (`db-0`, `db-1`), start in order, and each gets its own PVC that follows it. Many teams still prefer managed databases outside the cluster for simpler operations.',
      ],
      code: code`
        apiVersion: apps/v1
        kind: StatefulSet
        metadata:
          name: postgres
        spec:
          serviceName: postgres
          replicas: 1
          selector:
            matchLabels: { app: postgres }
          template:
            metadata:
              labels: { app: postgres }
            spec:
              containers:
                - name: db
                  image: postgres:17
                  volumeMounts:
                    - name: data
                      mountPath: /var/lib/postgresql/data
          volumeClaimTemplates:
            - metadata:
                name: data
              spec:
                accessModes: ["ReadWriteOnce"]
                storageClassName: standard
                resources:
                  requests:
                    storage: 20Gi
      `,
      lang: 'yaml',
      points: ['PVCs request durable storage.', 'StatefulSets: stable names, ordered start, a disk each.', 'Managed databases are often simpler.'],
      realWorld: 'A chat service runs its message queue as a StatefulSet so each broker keeps its own data across restarts.',
      check: { q: 'Why not store database files only inside a Deployment\'s container?', options: ['It is slower', 'The data is lost whenever the pod is replaced', 'It is not allowed', 'Containers cannot write files'], answer: 1, why: 'Container filesystems are ephemeral.' },
    },
    {
      id: 'jobs-daemonsets',
      level: 'advanced',
      title: 'Jobs, CronJobs and DaemonSets',
      summary: 'Not everything is a long-running server. Jobs run to completion, CronJobs run on a schedule, and DaemonSets run one pod on every node.',
      body: [
        'A **Job** runs pods until a task succeeds (with retries via `backoffLimit`), such as a data import or a database migration. A **CronJob** creates Jobs on a cron schedule (`"0 2 * * *"` = 2 a.m. daily).',
        'A **DaemonSet** places one pod on each node, which is ideal for node-level agents: log collectors, monitoring exporters and network plugins.',
      ],
      code: code`
        apiVersion: batch/v1
        kind: CronJob
        metadata:
          name: nightly-report
        spec:
          schedule: "0 2 * * *"             # every day at 02:00
          concurrencyPolicy: Forbid
          jobTemplate:
            spec:
              backoffLimit: 3
              template:
                spec:
                  restartPolicy: OnFailure
                  containers:
                    - name: report
                      image: acme/reports:1.4
                      args: ["--date", "yesterday", "--email", "ops@acme.com"]
      `,
      lang: 'yaml',
      points: ['Job = run to completion.', 'CronJob = Jobs on a schedule.', 'DaemonSet = one pod per node.'],
      realWorld: 'A school platform generates attendance reports nightly with a CronJob and ships node logs with a DaemonSet.',
      check: { q: 'You need a log collector on every node. Use a…', options: ['Deployment', 'DaemonSet', 'CronJob', 'Service'], answer: 1, why: 'DaemonSets run one pod per node.' },
    },
    {
      id: 'autoscaling',
      level: 'advanced',
      title: 'Autoscaling pods and nodes',
      summary: 'The Horizontal Pod Autoscaler adds pods when load rises; node autoscalers add machines when pods do not fit.',
      body: [
        'The **HPA** watches metrics (CPU, memory, or custom ones like requests per second) and adjusts a Deployment\'s replicas between a minimum and maximum. It needs resource requests and a metrics source (metrics-server). The **VPA** recommends or adjusts requests per pod instead.',
        'When pods are Pending for lack of room, the **Cluster Autoscaler** or **Karpenter** adds nodes, and removes them when idle. **KEDA** scales on event sources like queue length, even down to zero.',
      ],
      code: code`
        apiVersion: autoscaling/v2
        kind: HorizontalPodAutoscaler
        metadata:
          name: checkout
        spec:
          scaleTargetRef:
            apiVersion: apps/v1
            kind: Deployment
            name: checkout
          minReplicas: 3
          maxReplicas: 50
          metrics:
            - type: Resource
              resource:
                name: cpu
                target:
                  type: Utilization
                  averageUtilization: 60     # add pods above 60% of requested CPU
      `,
      lang: 'yaml',
      points: ['HPA scales pods on metrics.', 'Cluster Autoscaler/Karpenter scale nodes.', 'KEDA scales on events, even to zero.'],
      realWorld: 'Ticketing sites scale checkout from 3 to 50 pods within minutes when a big concert goes on sale.',
      check: { q: 'The HPA needs which setting on containers to compute CPU utilisation?', options: ['Labels', 'Resource requests', 'Liveness probes', 'A Service'], answer: 1, why: 'Utilisation is measured relative to requests.' },
    },
    {
      id: 'helm-kustomize',
      level: 'advanced',
      title: 'Packaging with Helm and Kustomize',
      summary: 'Real apps have many manifests and several environments. Helm templates them into versioned charts; Kustomize patches plain YAML per environment.',
      body: [
        '**Helm** packages manifests as a **chart** with templates and a `values.yaml`; `helm install` and `helm upgrade` create versioned releases you can roll back. Thousands of community charts exist (databases, monitoring).',
        '**Kustomize** (built into `kubectl apply -k`) keeps a plain **base** and small **overlays** per environment (more replicas in prod, different image tags), with no templating language.',
      ],
      code: code`
        # Helm
        helm repo add bitnami https://charts.bitnami.com/bitnami
        helm install cache bitnami/redis --set architecture=standalone
        helm upgrade shop ./charts/shop -f values-prod.yaml
        helm rollback shop 3

        # Kustomize layout
        k8s/base/{deployment.yaml, service.yaml, kustomization.yaml}
        k8s/overlays/prod/kustomization.yaml:
          resources: [../../base]
          replicas: [{ name: shop, count: 10 }]
          images: [{ name: acme/shop, newTag: "2.4.1" }]
        kubectl apply -k k8s/overlays/prod
      `,
      lang: 'bash',
      points: ['Helm = templated, versioned charts.', 'Kustomize = base + overlays, no templates.', 'Both keep environments consistent.'],
      realWorld: 'Platform teams install Prometheus, Grafana and ingress controllers with Helm charts in minutes.',
      check: { q: 'helm rollback shop 3 does what?', options: ['Deletes the cluster', 'Returns the shop release to revision 3', 'Scales to 3 pods', 'Shows logs'], answer: 1, why: 'Helm keeps release history.' },
    },
    // ------------------------------------------------------------ expert
    {
      id: 'scheduling',
      level: 'expert',
      title: 'Scheduling: affinity, taints, spread and disruption budgets',
      summary: 'Control where pods run and how many may go down at once, for performance, cost and high availability.',
      body: [
        '**Node affinity** prefers or requires node labels (GPU nodes, a zone). **Pod anti-affinity** and **topology spread constraints** spread replicas across nodes and zones so one failure cannot take them all. **Taints** repel pods from nodes unless they have matching **tolerations** (reserve GPU or spot nodes).',
        'A **PodDisruptionBudget** limits voluntary disruptions (node drains during upgrades): `minAvailable: 2` keeps at least two pods running. **PriorityClasses** let critical pods pre-empt less important ones.',
      ],
      code: code`
        spec:
          topologySpreadConstraints:
            - maxSkew: 1
              topologyKey: topology.kubernetes.io/zone
              whenUnsatisfiable: DoNotSchedule
              labelSelector: { matchLabels: { app: payments } }
          tolerations:
            - key: dedicated
              operator: Equal
              value: payments
              effect: NoSchedule
        ---
        apiVersion: policy/v1
        kind: PodDisruptionBudget
        metadata:
          name: payments
        spec:
          minAvailable: 2
          selector:
            matchLabels: { app: payments }
      `,
      lang: 'yaml',
      points: ['Spread replicas across zones.', 'Taints and tolerations reserve nodes.', 'PDBs protect availability during maintenance.'],
      realWorld: 'A payments platform spreads pods across three availability zones so a data-centre outage never stops payments.',
      check: { q: 'What does a PodDisruptionBudget protect against?', options: ['Bugs in code', 'Too many pods being evicted at once during voluntary disruptions', 'High CPU', 'DNS failures'], answer: 1, why: 'Drains respect the budget.' },
    },
    {
      id: 'security',
      level: 'expert',
      title: 'Security: RBAC, service accounts, pod security and network policies',
      summary: 'Defence in depth: least-privilege API access, locked-down containers, restricted network paths and trusted images.',
      body: [
        '**RBAC** grants verbs on resources through Roles bound to users, groups or **ServiceAccounts** (identities for pods). Give each workload its own ServiceAccount with only what it needs. **Pod Security Standards** (privileged, baseline, restricted) enforced per namespace block risky settings like running as root.',
        '**NetworkPolicies** whitelist which pods may talk to which (default: all can). Add image scanning and signing (for example Sigstore cosign), keep Secrets encrypted at rest or in an external manager, and keep clusters patched.',
      ],
      code: code`
        apiVersion: networking.k8s.io/v1
        kind: NetworkPolicy
        metadata:
          name: db-only-from-api
          namespace: shop
        spec:
          podSelector: { matchLabels: { app: postgres } }
          policyTypes: [Ingress]
          ingress:
            - from:
                - podSelector: { matchLabels: { app: orders-api } }
              ports:
                - port: 5432
        ---
        # Container hardening
        securityContext:
          runAsNonRoot: true
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          capabilities: { drop: ["ALL"] }
      `,
      lang: 'yaml',
      points: ['Least privilege with RBAC and per-app ServiceAccounts.', 'Enforce Pod Security Standards.', 'NetworkPolicies restrict pod-to-pod traffic.'],
      realWorld: 'A healthcare provider allows only its records API to reach the patient database, using a NetworkPolicy.',
      check: { q: 'By default, without NetworkPolicies, pods in a cluster…', options: ['Cannot talk to each other', 'Can all talk to each other', 'Only talk within a node', 'Need VPNs'], answer: 1, why: 'The default network is flat and open.' },
    },
    {
      id: 'observability',
      level: 'expert',
      title: 'Observability and troubleshooting',
      summary: 'You cannot fix what you cannot see. Combine metrics, logs, traces and events, and follow a methodical debugging path.',
      body: [
        '**Metrics** (Prometheus, Grafana) show trends and drive alerts; **logs** (Loki, Elasticsearch) show what happened; **traces** (OpenTelemetry, Jaeger, Tempo) follow one request through many services. Kubernetes **events** explain scheduling and lifecycle problems.',
        'Debug path: `get pods` (status) → `describe` (events) → `logs --previous` (why it crashed) → `get endpoints` (is traffic routed?) → `kubectl debug` (ephemeral debug container) → node and network checks. Common statuses: ImagePullBackOff (bad image or credentials), CrashLoopBackOff (app exits), Pending (no room or unbound volume), OOMKilled (memory limit).',
      ],
      code: code`
        kubectl get pods -n shop
        kubectl describe pod checkout-7d9f-abcde -n shop          # read Events at the bottom
        kubectl logs checkout-7d9f-abcde -n shop --previous        # logs from the crashed run
        kubectl get events -n shop --sort-by=.lastTimestamp
        kubectl top pods -n shop                                   # CPU/memory (metrics-server)
        kubectl debug -it checkout-7d9f-abcde --image=busybox:1.37 --target=app
      `,
      lang: 'bash',
      points: ['Metrics, logs, traces and events together.', 'get → describe → logs --previous → endpoints.', 'Know what each failure status means.'],
      realWorld: 'SRE teams trace a slow checkout across 12 microservices with OpenTelemetry to find one slow database call.',
      check: { q: 'A pod is in CrashLoopBackOff. Most useful first command?', options: ['kubectl get nodes', 'kubectl logs POD --previous', 'kubectl scale', 'kubectl version'], answer: 1, why: 'It shows output from the run that crashed.' },
      lesson: 'k-rollout',
    },
    {
      id: 'internals',
      level: 'expert',
      title: 'Inside the control plane: controllers, etcd and operators',
      summary: 'Every Kubernetes feature is a controller watching the API server and nudging reality towards the desired state. You can add your own with CRDs and operators.',
      body: [
        'The **API server** is the front door; all state lives in **etcd**, a consistent key-value store. The **scheduler** picks nodes for new pods; the **controller manager** runs control loops (Deployments, ReplicaSets, Nodes, Jobs). On each node the **kubelet** starts containers through the container runtime (containerd), and kube-proxy or an eBPF data plane routes Service traffic.',
        '**CustomResourceDefinitions (CRDs)** add new object kinds; an **operator** is a controller for one, encoding expert knowledge ("how to fail over a Postgres cluster"). Examples: cert-manager, Prometheus Operator, CloudNativePG.',
      ],
      code: code`
        kubectl apply  ──▶  API server  ──▶  etcd (stores desired state)
                                │ watch
              ┌─────────────────┼──────────────────┐
         Deployment ctrl    Scheduler          kubelet (node-2)
         creates ReplicaSet  assigns pod → node  starts container via containerd
         and Pods            (fits CPU, affinity) reports status back

        # A custom resource managed by an operator
        apiVersion: postgresql.cnpg.io/v1
        kind: Cluster
        metadata: { name: orders-db }
        spec: { instances: 3, storage: { size: 50Gi } }
      `,
      lang: 'text',
      points: ['API server + etcd hold the state.', 'Controllers reconcile; the scheduler places; kubelets run.', 'CRDs + operators extend Kubernetes.'],
      realWorld: 'Database teams run highly available PostgreSQL with an operator that automates backups and failover.',
      check: { q: 'Where does Kubernetes store the cluster\'s desired state?', options: ['On each node', 'In etcd', 'In Docker Hub', 'In kubectl'], answer: 1, why: 'etcd is the source of truth.' },
    },
    {
      id: 'gitops',
      level: 'expert',
      title: 'GitOps and production operations',
      summary: 'In production, people rarely run kubectl apply by hand. Git holds the desired state, and an agent keeps the cluster in sync.',
      body: [
        '**GitOps** (Argo CD, Flux): manifests live in Git; merging a pull request is how you deploy; the agent detects drift and reverts manual changes. Rollback is a git revert. CI builds and scans images, then updates the image tag in Git.',
        'Operating at scale also means: upgrading Kubernetes regularly (each minor version is supported for about 14 months upstream), managed services (EKS, GKE, AKS) for the control plane, multi-cluster setups for regions, cost management (right-sized requests, spot nodes) and disaster-recovery drills.',
      ],
      code: code`
        apiVersion: argoproj.io/v1alpha1
        kind: Application
        metadata:
          name: shop-prod
          namespace: argocd
        spec:
          project: default
          source:
            repoURL: https://github.com/acme/shop-deploy
            path: overlays/prod
            targetRevision: main
          destination:
            server: https://kubernetes.default.svc
            namespace: shop
          syncPolicy:
            automated:
              prune: true        # delete what was removed from Git
              selfHeal: true     # undo manual changes
      `,
      lang: 'yaml',
      points: ['Git is the source of truth; PRs deploy.', 'Agents fix drift automatically.', 'Plan upgrades, cost and disaster recovery.'],
      realWorld: 'Large retailers deploy hundreds of services a day through Argo CD, with every change reviewed in Git.',
      check: { q: 'In GitOps, how do you roll back a bad release?', options: ['SSH into nodes', 'Revert the commit in Git', 'Delete the cluster', 'Call support'], answer: 1, why: 'The agent syncs the cluster to Git.' },
    },
  ],
};
