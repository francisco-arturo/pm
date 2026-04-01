const BASE = '/api';

export async function fetchTasks() {
  const res = await fetch(`${BASE}/tasks`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchColumns() {
  const res = await fetch(`${BASE}/columns`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateColumns(columns) {
  const res = await fetch(`${BASE}/columns`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function renameColumn(oldName, newName) {
  const res = await fetch(`${BASE}/columns/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldName, newName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTask(data) {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTask(id, data) {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addComment(id, text) {
  const res = await fetch(`${BASE}/tasks/${id}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteComment(taskId, commentIndex) {
  const res = await fetch(`${BASE}/tasks/${taskId}/comments/${commentIndex}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function pushToGit(tasks) {
  const res = await fetch(`${BASE}/tasks/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchTasks(query) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
