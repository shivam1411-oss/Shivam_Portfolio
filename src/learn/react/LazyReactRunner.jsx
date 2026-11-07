import { Suspense, lazy } from 'react';

// The live React runner brings a JSX compiler, so it is downloaded only when a React lesson needs it.
const ReactRunner = lazy(() => import('./ReactRunner'));

export default function LazyReactRunner(props) {
  return (
    <Suspense fallback={<div className="my-6 h-40 rounded-2xl border border-line bg-surface animate-pulse" aria-label="Loading the React playground" />}>
      <ReactRunner {...props} />
    </Suspense>
  );
}
