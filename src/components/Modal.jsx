import { useEffect } from 'react';

export default function Modal({ title, body, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-xl font-bold text-gray-800">{title}</h3>
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-100 p-4 font-mono text-sm">
          {body}
        </pre>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow transition-colors hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
