import { StatusErrorPage } from './StatusErrorPage';

export function ServerErrorPage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return <StatusErrorPage kind="serverError" onRetry={handleRetry} />;
}
