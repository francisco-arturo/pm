# PM Board

Lightweight, single-user Kanban project management board that stores tasks in a
markdown file and syncs via Git.

## Features

- Kanban board with 3 columns: To Do, In Progress, Done
- Drag-and-drop tasks between columns
- Create, edit, and comment on tasks
- Push changes to a Git remote with one click
- Search tasks by title
- Dark mode support (follows system preference)
- All data lives in a single `tasks.md` file

## Setup

1. **Clone a Git repository** that will hold your tasks (or init a new one):
   ```bash
   git init my-project && cd my-project
   touch tasks.md && git add . && git commit -m "init"
   ```

2. **Copy this project** into the repo directory, or point `GIT_REPO_PATH` at it.

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment** (copy and edit):
   ```bash
   cp .env.example .env
   ```
   Variables:
   | Variable | Default | Description |
   |---|---|---|
   | `TASK_FILE_PATH` | `./tasks.md` | Path to the markdown task file |
   | `GIT_REPO_PATH` | `./` | Path to the Git repository |
   | `PORT` | `3000` | Server port |

5. **Build the frontend** (first time only):
   ```bash
   npm run build
   ```

6. **Start the server**:
   ```bash
   npm start
   ```

7. Open `http://localhost:3000` in your browser.

## Development

Run the backend and Vite dev server separately:

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend (with hot reload)
cd frontend && npm run dev
```

The Vite dev server proxies `/api` requests to Express on port 3000.

## Task File Format

```markdown
## Task 1
- **ID**: task_001_a1b2c3d4
- **Status**: To Do
- **Title**: Implement feature X
- **Description**: Detailed description here
- **Comments**:
  - 2024-01-15 10:30 AM: Started working on this
```

## Tech Stack

- **Backend**: Node.js, Express, simple-git
- **Frontend**: React 18, Tailwind CSS v4, @hello-pangea/dnd
- **Build**: Vite
