import { useState, useEffect, useCallback, useMemo } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import SearchBar from './components/SearchBar';
import Toast from './components/Toast';
import {
  fetchTasks,
  fetchColumns,
  updateColumns,
  createTask,
  updateTask,
  addComment,
  deleteComment,
  deleteTask,
  pushToGit,
} from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState(['To Do', 'In Progress', 'Done']);
  const [searchQuery, setSearchQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [modal, setModal] = useState({ open: false, task: null, isCreate: false });
  const [pushing, setPushing] = useState(false);

  const loadBoard = useCallback(async () => {
    try {
      const [taskData, colData] = await Promise.all([fetchTasks(), fetchColumns()]);
      setTasks(taskData);
      setColumns(colData.columns);
    } catch (err) {
      setToast({ message: `Failed to load board: ${err.message}`, type: 'error' });
    }
  }, []);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const statusCounts = useMemo(() => {
    const m = {};
    for (const t of tasks) {
      m[t.status] = (m[t.status] || 0) + 1;
    }
    return m;
  }, [tasks]);

  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  async function handleDragEnd(result) {
    if (!result.destination) return;

    if (result.type === 'COLUMN') {
      if (result.source.index === result.destination.index) return;
      const next = Array.from(columns);
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, moved);
      try {
        const data = await updateColumns(next);
        setColumns(data.columns);
        setDirty(true);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
        loadBoard();
      }
      return;
    }

    const newStatus = result.destination.droppableId;
    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTask(taskId, { status: newStatus });
      setDirty(true);
    } catch (err) {
      setToast({ message: `Failed to move task: ${err.message}`, type: 'error' });
      loadBoard();
    }
  }

  async function handleSaveCreate(data) {
    try {
      const task = await createTask(data);
      setTasks(prev => [...prev, task]);
      setDirty(true);
      setToast({ message: 'Task created', type: 'success' });
    } catch (err) {
      setToast({ message: `Failed to create: ${err.message}`, type: 'error' });
    }
  }

  async function handleSaveEdit(id, data) {
    try {
      const updated = await updateTask(id, data);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      setDirty(true);
    } catch (err) {
      setToast({ message: `Failed to update: ${err.message}`, type: 'error' });
    }
  }

  async function handleAddComment(id, text) {
    try {
      const updated = await addComment(id, text);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      setDirty(true);
    } catch (err) {
      setToast({ message: `Failed to add comment: ${err.message}`, type: 'error' });
    }
  }

  async function handleDeleteComment(taskId, commentIndex) {
    try {
      const updated = await deleteComment(taskId, commentIndex);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setDirty(true);
      setToast({ message: 'Comment removed', type: 'success' });
    } catch (err) {
      setToast({ message: `Failed to delete comment: ${err.message}`, type: 'error' });
      throw err;
    }
  }

  async function handleDeleteTask(id) {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setDirty(true);
      setToast({ message: 'Task deleted', type: 'success' });
    } catch (err) {
      setToast({ message: `Failed to delete task: ${err.message}`, type: 'error' });
      throw err;
    }
  }

  async function handlePush() {
    setPushing(true);
    try {
      const result = await pushToGit(tasks);
      setDirty(false);
      setToast({ message: result.message || 'Pushed to Git', type: 'success' });
      await loadBoard();
    } catch (err) {
      setToast({ message: `Push failed: ${err.message}`, type: 'error' });
    } finally {
      setPushing(false);
    }
  }

  async function handleAddColumn(name) {
    const t = name.trim();
    if (!t) return;
    if (columns.includes(t)) {
      setToast({ message: 'A column with that name already exists', type: 'error' });
      return;
    }
    try {
      const data = await updateColumns([...columns, t]);
      setColumns(data.columns);
      setDirty(true);
      setToast({ message: 'Column added', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleRemoveColumn(status) {
    if ((statusCounts[status] || 0) > 0) return;
    try {
      const next = columns.filter(c => c !== status);
      const data = await updateColumns(next);
      setColumns(data.columns);
      setDirty(true);
      setToast({ message: 'Column removed', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ background: 'radial-gradient(ellipse 90% 40% at 50% -5%, rgba(124,58,237,0.09) 0%, transparent 60%), #030712' }}
    >
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h1 className="text-[15px] font-semibold tracking-tight text-white">PM Board</h1>
          </div>

          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <button
              onClick={() => setModal({ open: true, task: null, isCreate: true })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 active:scale-95"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>

            {dirty && (
              <button
                onClick={handlePush}
                disabled={pushing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:opacity-50 active:scale-95"
              >
                {pushing ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Pushing...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Push to Git
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[min(100%,1400px)] px-4 py-6">
        <Board
          columns={columns}
          tasks={filteredTasks}
          statusCounts={statusCounts}
          onDragEnd={handleDragEnd}
          onTaskClick={task => setModal({ open: true, task, isCreate: false })}
          onAddColumn={handleAddColumn}
          onRemoveColumn={handleRemoveColumn}
        />
      </main>

      {modal.open && (
        <TaskModal
          key={modal.isCreate ? 'create' : modal.task.id}
          task={modal.task}
          isCreate={modal.isCreate}
          onSave={modal.isCreate ? handleSaveCreate : handleSaveEdit}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onDeleteTask={modal.isCreate ? undefined : handleDeleteTask}
          onClose={() => setModal({ open: false, task: null, isCreate: false })}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
