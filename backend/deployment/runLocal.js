import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';


export async function runStepTemp(rootPath, subPath) {

  let joinedPath = path.join(rootPath, subPath)

  return new Promise((resolve, reject) => {
    const child = spawn(`npm install`, {
      cwd: joinedPath,
      shell: true,
    });


    let output = '';
    child.stdout.on('data', (c) => output += c.toString());
    child.stderr.on('data', (c) => output += c.toString());
    child.on('close', (exitCode) => resolve({ exitCode, output }));
    child.on('error', reject);
  });
}

export async function runStepPerm(rootPath, subPath, command) {

  let joinedPath = path.join(rootPath, subPath)

  const envContents = await fs.promises.readFile(path.join(joinedPath, '.env'), 'utf-8');
  const parsed = dotenv.parse(envContents);

  const child = spawn(command, {
    cwd: joinedPath,
    shell: true,
    detached: true,
    stdio: 'pipe',
    env: { ...process.env, ...parsed }
  })

  child.unref();

  let earlyErrors = '';
  child.stderr?.on('data', (data) => { earlyErrors += data.toString(); });
  child.stdout?.on('data', (data) => { earlyErrors += data.toString(); });

  let startupLogs = '';
  child.stderr?.on('data', (data) => { startupLogs += data.toString(); });
  child.stdout?.on('data', (data) => { startupLogs += data.toString(); });

  return new Promise((resolve, reject) => {
    const startupCheckTimeout = setTimeout(() => {

      child.stdout?.removeAllListeners();
      child.stderr?.removeAllListeners();

      child.stdout?.unref();
      child.stderr?.unref();

      resolve({ status: "running", pid: child.pid, logs: startupLogs});
    }, 3000);

    child.on('exit', (code) => {
      clearTimeout(startupCheckTimeout);
      reject(new Error(`Server crashed immediately on startup with code ${code}. Logs:\n${earlyErrors}`));
    });

    child.on('error', (err) => {
      clearTimeout(startupCheckTimeout);
      reject(err);
    });
  })
}
