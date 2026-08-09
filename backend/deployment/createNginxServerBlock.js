import fs from 'fs/promises';
import { runCheck } from '../utils/runCheck.js'

export async function createNginxServerBlock(subdomain, port) {
  const config = `
server {
    listen 80;
    server_name ${subdomain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
`.trim();

  const availablePath = `/etc/nginx/sites-available/${subdomain}`;
  const enabledPath = `/etc/nginx/sites-enabled/${subdomain}`;

  await fs.writeFile(`/tmp/${subdomain}.conf`, config);

  await runCheck('pkexec', ['cp', `/tmp/${subdomain}.conf`, availablePath]);
  await runCheck('pkexec', ['ln', '-sf', availablePath, enabledPath]);

  const testResult = await runCheck('pkexec', ['nginx', '-t']);
  if (!testResult.success) {
    throw new Error(`Nginx config test failed: ${testResult.output}`);
  }

  const reloadResult = await runCheck('pkexec', ['systemctl', 'reload', 'nginx']);
  if (!reloadResult.success) {
    throw new Error(`Nginx reload failed: ${reloadResult.output}`);
  }

  return { availablePath, enabledPath };
}