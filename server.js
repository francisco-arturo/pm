require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { parseTasks, stringifyTasks } = require('./markdown-parser');
const gitSync = require('./git-sync');

const app = express();
app.use(cors());
app.use(express.json());

const TASK_FILE = path.resolve(process.env.TASK_FILE_PATH || './tasks.md');
const COLUMNS_FILE = path.resolve(
  process.env.COLUMNS_FILE_PATH || path.join(path.dirname(TASK_FILE), 'columns.json'),
);
const GIT_REPO  = path.resolve(process.env.GIT_REPO_PATH  || './');
const PORT      = process.env.PORT || 3000;

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];

gitSync.init(GIT_REPO, [TASK_FILE, COLUMNS_FILE]);

function readTasks() {
  if (!fs.existsSync(TASK_FILE)) fs.writeFileSync(TASK_FILE, '', 'utf-8');
  return parseTasks(fs.readFileSync(TASK_FILE, 'utf-8'));
}

function writeTasks(tasks) {
  fs.writeFileSync(TASK_FILE, stringifyTasks(tasks), 'utf-8');
}

function normalizeColumnNames(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const out = [];
  for (const c of arr) {
    const t = String(c ?? '').trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function readColumnsFromFile() {
  if (!fs.existsSync(COLUMNS_FILE)) return [...DEFAULT_COLUMNS];
  try {
    const raw = JSON.parse(fs.readFileSync(COLUMNS_FILE, 'utf-8'));
    const list = normalizeColumnNames(raw.columns);
    return list.length ? list : [...DEFAULT_COLUMNS];
  } catch {
    return [...DEFAULT_COLUMNS];
  }
}

function writeColumnsFile(columns) {
  fs.writeFileSync(COLUMNS_FILE, `${JSON.stringify({ columns }, null, 2)}\n`, 'utf-8');
}

function mergeColumnsWithTasks(fileColumns, tasks) {
  const used = new Set(tasks.map(t => t.status));
  const out = [...fileColumns];
  for (const s of used) {
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

function getColumnsForApi() {
  const tasks = readTasks();
  return mergeColumnsWithTasks(readColumnsFromFile(), tasks);
}

function generateId(tasks) {
  const counter = tasks.length + 1;
  const hash = crypto.randomBytes(4).toString('hex');
  return `task_${String(counter).padStart(3, '0')}_${hash}`;
}

// --- API Routes ---

app.get('/api/tasks', (_req, res) => {
  try {
    res.json(readTasks());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/columns', (_req, res) => {
  try {
    res.json({ columns: getColumnsForApi() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/columns', (req, res) => {
  try {
    const tasks = readTasks();
    const next = normalizeColumnNames(req.body?.columns);
    if (next.length === 0) {
      return res.status(400).json({ error: 'At least one column is required' });
    }
    const used = new Set(tasks.map(t => t.status));
    for (const s of used) {
      if (s && !next.includes(s)) {
        return res.status(400).json({
          error: `Cannot remove column "${s}" while tasks use it`,
        });
      }
    }
    writeColumnsFile(next);
    res.json({ columns: mergeColumnsWithTasks(next, tasks) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const tasks = readTasks();
    const cols = getColumnsForApi();
    const task = {
      id: generateId(tasks),
      status: cols[0] || 'To Do',
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      comments: [],
    };
    tasks.push(task);
    writeTasks(tasks);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.body.title !== undefined)       task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined)      task.status = req.body.status;

    writeTasks(tasks);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    const [removed] = tasks.splice(idx, 1);
    writeTasks(tasks);
    res.json(removed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id/comments/:index', (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const index = Number.parseInt(req.params.index, 10);
    if (!Number.isInteger(index) || index < 0 || index >= task.comments.length) {
      return res.status(400).json({ error: 'Invalid comment index' });
    }
    task.comments.splice(index, 1);
    writeTasks(tasks);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/comment', (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const now = new Date();
    const hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${h12}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;
    const comment = `${timestamp}: ${req.body.text}`;
    task.comments.push(comment);

    writeTasks(tasks);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search', (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    const tasks = readTasks().filter(t => t.title.toLowerCase().includes(q));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/push', async (req, res) => {
  try {
    const uiTasks = req.body.tasks || [];

    // Read latest from disk
    const fileTasks = readTasks();
    const fileMap = new Map(fileTasks.map(t => [t.id, t]));
    const uiMap = new Map(uiTasks.map(t => [t.id, t]));

    // Merge: file version wins for conflicts, keep all unique
    const merged = [];
    const seen = new Set();

    for (const ft of fileTasks) {
      merged.push(ft);
      seen.add(ft.id);
    }
    for (const ut of uiTasks) {
      if (!seen.has(ut.id)) {
        merged.push(ut);
        seen.add(ut.id);
      }
    }

    writeTasks(merged);

    await gitSync.pullLatest();
    const ts = new Date().toISOString();
    await gitSync.pushChanges(`Update tasks: ${ts}`);

    res.json({ success: true, message: `Pushed ${merged.length} tasks at ${ts}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Static files (production build) ---
app.use(express.static(path.join(__dirname, 'public')));
app.get('/{*splat}', (_req, res) => {
  const index = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(index)) return res.sendFile(index);
  res.status(404).send('Frontend not built yet. Run: npm run build');
});

// --- Start ---
async function start() {
  await gitSync.syncOnLoad();
  app.listen(PORT, () => console.log(`[pm] Server running on http://localhost:${PORT}`));
}
start();
