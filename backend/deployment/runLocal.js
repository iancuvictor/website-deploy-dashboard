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
  const joinedPath = path.join(rootPath, subPath);

  const envContents = await fs.promises.readFile(path.join(joinedPath, '.env'), 'utf-8');
  const parsed = dotenv.parse(envContents);

  const child = spawn(command, {
    cwd: joinedPath,
    shell: true,
    detached: true,
    stdio: 'pipe',
    env: { ...process.env, ...parsed },
  });

  child.unref();

  let logs = '';
  child.stdout?.on('data', (data) => { logs += data.toString(); });
  child.stderr?.on('data', (data) => { logs += data.toString(); });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      child.stdout?.removeAllListeners();
      child.stderr?.removeAllListeners();
      child.stdout?.unref();
      child.stderr?.unref();

      resolve({ status: 'running', pid: child.pid, logs });
    }, 3000);

    child.on('exit', (code) => {
      clearTimeout(timeout);
      resolve({ status: 'crashed', exitCode: code, logs });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ status: 'crashed', error: err.message, logs });
    });
  });
}