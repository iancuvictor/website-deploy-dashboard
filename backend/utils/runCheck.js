import { spawn } from 'child_process';

export function runCheck(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args);
    let output = '';

    child.stdout.on('data', (c) => output += c.toString());
    child.stderr.on('data', (c) => output += c.toString());
    child.on('close', (code) => resolve({ success: code === 0, output }));
    child.on('error', () => resolve({ success: false, output: '' }));
  });
}