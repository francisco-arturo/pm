import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import SearchBar from './components/SearchBar';
import Toast from './components/Toast';
import { fetchTasks, createTask, updateTask, addComment, pushToGit } from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [modal, setModal] = useState({ open: false, task: null, isCreate: false });
  const [pushing, setPushing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setToast({ message: `Failed to load tasks: ${err.message}`, type: 'error' });
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  async function handleDragEnd(result) {
    if (!result.destination) return;
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
      loadTasks();
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

  async function handlePush() {
    setPushing(true);
    try {
      const result = await pushToGit(tasks);
      setDirty(false);
      setToast({ message: result.message || 'Pushed to Git', type: 'success' });
      await loadTasks();
    } catch (err) {
      setToast({ message: `Push failed: ${err.message}`, type: 'error' });
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">PM Board</h1>

          <div className="flex items-center gap-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <button
              onClick={() => setModal({ open: true, task: null, isCreate: true })}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New Task
            </button>

            {dirty && (
              <button
                onClick={handlePush}
                disabled={pushing}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pushing ? 'Pushing...' : 'Push to Git'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Board
          tasks={filteredTasks}
          onDragEnd={handleDragEnd}
          onTaskClick={task => setModal({ open: true, task, isCreate: false })}
        />
      </main>

      {modal.open && (
        <TaskModal
          task={modal.task}
          isCreate={modal.isCreate}
          onSave={modal.isCreate ? handleSaveCreate : handleSaveEdit}
          onAddComment={handleAddComment}
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
