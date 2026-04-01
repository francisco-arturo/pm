import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
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

export default function TaskModal({
  task,
  isCreate,
  onSave,
  onAddComment,
  onDeleteTask,
  onDeleteComment,
  onClose,
}) {
  const [title, setTitle] = useState(() => (task?.title ?? ''));
  const [description, setDescription] = useState(() => task?.description ?? '');
  const [commentText, setCommentText] = useState('');
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (confirm) setConfirm(null);
        else onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, confirm]);

  function handleBackdrop(e) {
    if (confirm) return;
    if (e.target === backdropRef.current) onClose();
  }

  async function handleSave() {
    if (isCreate) {
      await onSave({ title, description });
    } else {
      await onSave(task.id, { title, description });
    }
    if (commentText.trim() && !isCreate && task) {
      await onAddComment(task.id, commentText.trim());
    }
    onClose();
  }

  async function confirmDeleteTask() {
    try {
      await onDeleteTask(task.id);
      setConfirm(null);
      onClose();
    } catch {
      setConfirm(null);
    }
  }

  async function confirmDeleteComment() {
    const idx = confirm?.commentIndex;
    if (idx === undefined) return;
    try {
      await onDeleteComment(task.id, idx);
      setConfirm(null);
    } catch {
      setConfirm(null);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:bg-white/[0.06]';

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        className="animate-slide-drawer-in flex h-full w-full max-w-2xl flex-col border-l border-white/[0.08] bg-gray-950 shadow-2xl shadow-black/60"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isCreate ? 'New Task' : 'Edit Task'}
            </h2>
            {task && !isCreate && (
              <p className="mt-0.5 text-[11px] font-mono text-gray-600">{task.id}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/[0.06] hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="shrink-0">
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <label className="shrink-0 text-xs font-medium text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`${inputClass} min-h-[min(42vh,320px)] flex-1 resize-y font-mono text-[13px] leading-relaxed`}
              placeholder="Add a description…"
            />
          </div>

          {!isCreate && task && task.comments.length > 0 && (
            <div className="shrink-0">
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Comments ({task.comments.length})
              </label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-black/30 p-3">
                {task.comments.map((c, i) => (
                  <div key={i} className="group flex gap-2">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-600/20">
                      <span className="text-[9px] font-bold text-violet-400">U</span>
                    </div>
                    <div className="min-w-0 flex-1 task-markdown-preview text-xs leading-relaxed text-gray-400">
                      <ReactMarkdown>{c}</ReactMarkdown>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirm({ type: 'comment', commentIndex: i })}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-gray-600 opacity-70 transition-all hover:bg-white/[0.08] hover:text-red-400 group-hover:opacity-100"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <span className="text-sm leading-none">×</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isCreate && (
            <div className="shrink-0">
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Add Comment</label>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className={inputClass}
                placeholder="Write a comment…"
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4">
          <div>
            {!isCreate && task && onDeleteTask && (
              <button
                type="button"
                onClick={() => setConfirm({ type: 'task' })}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-400/90 transition-all hover:bg-red-500/10 hover:text-red-300"
              >
                Delete task
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/[0.05] hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 active:scale-95"
            >
              {isCreate ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {confirm?.type === 'task' && (
        <ConfirmDialog
          title="Delete task?"
          message="This will remove the task from the board and from tasks.md. This cannot be undone."
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={confirmDeleteTask}
        />
      )}
      {confirm?.type === 'comment' && (
        <ConfirmDialog
          title="Delete comment?"
          message="Remove this comment permanently?"
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={confirmDeleteComment}
        />
      )}
    </div>
  );
}
