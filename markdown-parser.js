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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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
        case 'Description': {
          let desc = (value || '').trim();
          while (i + 1 < lines.length && !FIELD_RE.test(lines[i + 1])) {
            i++;
            desc = desc ? `${desc}\n${lines[i]}` : lines[i];
          }
          task.description = desc;
          break;
        }
        case 'Comments':
          inComments = true;
          break;
      }
    }

    if (task.id) tasks.push(task);
  }

  return tasks;
}

function formatDescriptionForFile(description) {
  const d = description || '';
  if (!d.includes('\n')) return `- **Description**: ${d}\n`;
  return `- **Description**:\n${d}\n`;
}

function stringifyTasks(tasks) {
  return tasks.map((t, i) => {
    let md = `## Task ${i + 1}\n`;
    md += `- **ID**: ${t.id}\n`;
    md += `- **Status**: ${t.status}\n`;
    md += `- **Title**: ${t.title}\n`;
    md += formatDescriptionForFile(t.description);
    md += `- **Comments**:\n`;
    for (const c of t.comments) {
      md += `  - ${c}\n`;
    }
    return md;
  }).join('\n');
}

module.exports = { parseTasks, stringifyTasks };
