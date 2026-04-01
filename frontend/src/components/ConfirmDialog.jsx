export default function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-xl border border-white/[0.1] bg-gray-950 p-5 shadow-2xl"
      >
        <h3 id="confirm-title" className="text-sm font-semibold text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/[0.06] hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 active:scale-95 ${
              danger
                ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500/50'
                : 'bg-violet-600 hover:bg-violet-500 focus:ring-violet-500/50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
