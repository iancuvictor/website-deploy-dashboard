import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { io } from '../server.js';
import Log from '../schemas/log.js';


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




export async function runStepPerm(rootPath, subPath, command, stepId, logsPath) {
  const joinedPath = path.join(rootPath, subPath);
  
  const timestamp = Date.now();
  const logFile = path.join(logsPath, `Step_${stepId}_Timestamp_${timestamp}.txt`)
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
  }

  let doesEnvExist = fs.existsSync(path.join(joinedPath, '.env'));
  let parsed = {};

  if (doesEnvExist) {
    const envContents = await fs.promises.readFile(path.join(joinedPath, '.env'), 'utf-8');
    parsed = dotenv.parse(envContents);
  }

  const child = spawn(command, {
    cwd: joinedPath,
    shell: true,
    detached: true,
    stdio: 'pipe',
    env: { ...process.env, ...parsed },
  });

  child.unref();

  let logs = '';

  const count = await Log.countDocuments({ stepId });
  child.stdout?.on('data', async (data) => {
    const chunk = data.toString();
    logs += chunk;
    io.emit('deployLog', { stepId, chunk });
    fs.appendFileSync(logFile, chunk);
    if (count >= 100) {
      const oldest = await Log.find({ stepId }).sort({ timestamp: 1 }).limit(count - 99);
      await Log.deleteMany({ _id: { $in: oldest.map(d => d._id) } });
    }
    await Log.create({
      stepId: stepId,
      message: chunk
    })
  });
  child.stderr?.on('data', async (data) => {
    const chunk = data.toString();
    logs += chunk;
    io.emit('deployLog', { stepId, chunk });
    fs.appendFileSync(logFile, chunk);
    if (count >= 100) {
      const oldest = await Log.find({ stepId }).sort({ timestamp: 1 }).limit(count - 99);
      await Log.deleteMany({ _id: { $in: oldest.map(d => d._id) } });
    }
    await Log.create({
      stepId: stepId,
      message: chunk
    })
  });

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

export async function createLocalBackup() {

}