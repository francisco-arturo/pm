const simpleGit = require('simple-git');
const path = require('path');

let git;
let taskFilePath;

function init(repoPath, filePath) {
  git = simpleGit(repoPath);
  taskFilePath = filePath;
}

async function getDefaultBranch() {
  const remoteInfo = await git.remote(['show', 'origin']).catch(() => null);
  if (remoteInfo) {
    const match = remoteInfo.match(/HEAD branch:\s*(\S+)/);
    if (match) return match[1];
  }
  const branches = await git.branchLocal();
  return branches.current || 'main';
}

async function pullLatest() {
  const branch = await getDefaultBranch();
  await git.pull('origin', branch);
}

async function pushChanges(message) {
  const branch = await getDefaultBranch();
  await git.add(taskFilePath);
  await git.commit(message);
  await git.push('origin', branch);
}

async function syncOnLoad() {
  try {
    const branch = await getDefaultBranch();
    await pullLatest();
    console.log(`[git] Pulled latest from origin/${branch}`);
  } catch (err) {
    console.warn('[git] Pull on startup failed (may be offline or no remote):', err.message);
  }
}

module.exports = { init, pullLatest, pushChanges, syncOnLoad };
