import express from 'express';
import { spawn } from 'child_process';

const routes = express.Router();

function runCheck(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args);
    let output = '';

    child.stdout.on('data', (c) => output += c.toString());
    child.stderr.on('data', (c) => output += c.toString());
    child.on('close', (code) => resolve({ success: code === 0, output }));
    child.on('error', () => resolve({ success: false, output: '' }));
  });
}

routes.get('/status', async (req, res) => {
  try {
    const [nginxInstalled, nginxActive, certbotInstalled, ufwInstalled, ufwStatus] = await Promise.all([
      runCheck('which', ['nginx']),
      runCheck('systemctl', ['is-active', 'nginx']),
      runCheck('which', ['certbot']),
      runCheck('which', ['ufw']),
      runCheck('pkexec', ['ufw', 'status']),
    ]);

    // const config = await HostConfig.findOne();

    res.status(200).json({
      nginxInstalled: nginxInstalled.success,
      nginxRunning: nginxActive.output.trim() === 'active',
      certbotInstalled: certbotInstalled.success,
      ufwInstalled: ufwInstalled.success,
      ufwActive: ufwStatus.output.includes('Status: active'),
    //   ddnsConfigured: config !== null,
    });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred' });
    console.log(err);
  }
});

routes.post('/installNginx', async (req, res) => {
  try {
    const result = await runCheck('pkexec', ['apt', 'install', '-y', 'nginx']);

    if (!result.success) {
      return res.status(500).json({ message: 'Nginx installation failed', output: result.output });
    }

    res.status(200).json({ message: 'Nginx installed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred' });
  }
});

routes.post('/activateNginx', async (req, res) => {
  try {
    const result = await runCheck('pkexec', ['systemctl', 'enable', '--now', 'nginx']);

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to activate Nginx', output: result.output });
    }

    res.status(200).json({ message: 'Nginx activated' });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred' });
  }
});

routes.post('/installCertbot', async (req, res) => {
  try {
    const result = await runCheck('pkexec', ['apt', 'install', '-y', 'certbot', 'python3-certbot-nginx']);

    if (!result.success) {
      return res.status(500).json({ message: 'Certbot installation failed', output: result.output });
    }

    res.status(200).json({ message: 'Certbot installed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred' });
  }
});

routes.post('/installUfw', async (req, res) => {
  try {
    const result = await runCheck('pkexec', ['apt', 'install', '-y', 'ufw']);

    if (!result.success) {
      return res.status(500).json({ message: 'Ufw installation failed', output: result.output });
    }

    res.status(200).json({ message: 'Ufw installed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred' });
  }
});

routes.post('/activateUfw', async (req, res) => {
  try {
    const allowSsh = await runCheck('pkexec', ['ufw', 'allow', 'OpenSSH']);
    const allowHttp = await runCheck('pkexec', ['ufw', 'allow', '80']);
    const allowHttps = await runCheck('pkexec', ['ufw', 'allow', '443']);
    const enable = await runCheck('pkexec', ['ufw', '--force', 'enable']);

    if (!enable.success) {
      return res.status(500).json({ message: 'Failed to activate Ufw', output: enable.output });
    }

    res.status(200).json({ message: 'Ufw activated' });
  } catch (err) {
    res.status(500).json({ message: 'An error has occurred' });
    console.log(error);
  }
});


export default routes;