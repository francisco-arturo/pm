const fs = require('fs');
const simpleGit = require('simple-git');
const path = require('path');

let git;
let trackedFiles = [];

function init(repoPath, filePaths) {
  git = simpleGit(repoPath);
  trackedFiles = Array.isArray(filePaths) ? filePaths : [filePaths];
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
  const paths = trackedFiles.filter(f => fs.existsSync(f));
  if (paths.length) await git.add(paths);
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
