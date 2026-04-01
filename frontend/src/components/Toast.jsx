import { useEffect } from 'react';

export default function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  const bg = type === 'error'
    ? 'bg-red-600'
    : 'bg-emerald-600';

  return (
    <div className={`fixed bottom-6 right-6 z-[100] max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${bg}`}>
      {message}
    </div>
  );
}
