import { useState, useEffect, useRef } from 'react';

const STATUSES = ['To Do', 'In Progress', 'Done'];

export default function TaskModal({ task, isCreate, onSave, onAddComment, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [commentText, setCommentText] = useState('');
  const backdropRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    } else {
      setTitle('');
      setDescription('');
      setStatus('To Do');
    }
    setCommentText('');
  }, [task]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleBackdrop(e) {
    if (e.target === backdropRef.current) onClose();
  }

  async function handleSave() {
    if (isCreate) {
      await onSave({ title, description });
    } else {
      await onSave(task.id, { title, description, status });
    }
    if (commentText.trim() && !isCreate && task) {
      await onAddComment(task.id, commentText.trim());
    }
    onClose();
  }

  const inputClass = "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:bg-white/[0.06]";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="animate-slide-up w-full max-w-lg rounded-2xl border border-white/[0.08] bg-gray-950 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isCreate ? 'New Task' : 'Edit Task'}
            </h2>
            {task && !isCreate && (
              <p className="mt-0.5 text-[11px] font-mono text-gray-600">{task.id}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/[0.06] hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Add a description..."
            />
          </div>

          {!isCreate && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={inputClass}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {!isCreate && task && task.comments.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Comments ({task.comments.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2.5 rounded-lg bg-black/30 p-3">
                {task.comments.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-violet-400">U</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isCreate && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Add Comment</label>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className={inputClass}
                placeholder="Write a comment..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-white/[0.05] hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 active:scale-95"
          >
            {isCreate ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
