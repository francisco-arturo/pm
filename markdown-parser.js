const FIELD_RE = /^- \*\*(\w+)\*\*:\s*(.*)$/;
const COMMENT_RE = /^\s{2}- (.+)$/;

function parseTasks(markdown) {
  if (!markdown || !markdown.trim()) return [];

  const sections = markdown.split(/^## /m).filter(Boolean);
  const tasks = [];

  for (const section of sections) {
    const lines = section.split('\n');
    const task = { id: '', status: 'To Do', title: '', description: '', comments: [] };
    let inComments = false;

    for (const line of lines) {
      if (inComments) {
        const cm = line.match(COMMENT_RE);
        if (cm) {
          task.comments.push(cm[1]);
          continue;
        }
        if (line.trim() === '') continue;
        inComments = false;
      }

      const fm = line.match(FIELD_RE);
      if (!fm) continue;

      const [, key, value] = fm;
      switch (key) {
        case 'ID':          task.id = value.trim(); break;
        case 'Status':      task.status = value.trim(); break;
        case 'Title':       task.title = value.trim(); break;
        case 'Description': task.description = value.trim(); break;
        case 'Comments':
          inComments = true;
          break;
      }
    }

    if (task.id) tasks.push(task);
  }

  return tasks;
}

function stringifyTasks(tasks) {
  return tasks.map((t, i) => {
    let md = `## Task ${i + 1}\n`;
    md += `- **ID**: ${t.id}\n`;
    md += `- **Status**: ${t.status}\n`;
    md += `- **Title**: ${t.title}\n`;
    md += `- **Description**: ${t.description}\n`;
    md += `- **Comments**:\n`;
    for (const c of t.comments) {
      md += `  - ${c}\n`;
    }
    return md;
  }).join('\n');
}

module.exports = { parseTasks, stringifyTasks };
