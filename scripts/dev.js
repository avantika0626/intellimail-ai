const { spawn, fork } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.resolve(rootDir, 'server');
const clientDir = path.resolve(rootDir, 'client');

console.log('🚀 Launching Agentflow_AI Services...\n');

// 1. Start Backend via fork
const serverProc = fork(path.join(serverDir, 'src/server.js'), [], {
  cwd: serverDir,
  env: { ...process.env, PORT: '5000' },
});

// 2. Start Frontend via npm run dev with stdio inherit
const clientProc = spawn('npm', ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3000' },
});

function cleanup() {
  console.log('\n🛑 Shutting down Agentflow_AI...');
  try { serverProc.kill(); } catch {}
  try { clientProc.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
