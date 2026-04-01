const simpleGit = require('simple-git');
const path = require('path');

let git;
let taskFilePath;

function init(repoPath, filePath) {
  git = simpleGit(repoPath);
  taskFilePath = filePath;
}

async function pullLatest() {
  await git.pull('origin', 'main');
}

async function pushChanges(message) {
  await git.add(taskFilePath);
  await git.commit(message);
  await git.push('origin', 'main');
}

async function syncOnLoad() {
  try {
    await pullLatest();
    console.log('[git] Pulled latest from origin/main');
  } catch (err) {
    console.warn('[git] Pull on startup failed (may be offline or no remote):', err.message);
  }
}

module.exports = { init, pullLatest, pushChanges, syncOnLoad };
