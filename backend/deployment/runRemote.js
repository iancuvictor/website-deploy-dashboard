import { Client } from 'ssh2';
import fs from 'fs';

const conn = new Client();

conn.on('ready', () => {
    console.log('connected');
});

conn.on('error', () => {
    console.log('error');
});

conn.connect({
  host: 'localhost',
  port: 22,
  username: 'victor',
  privateKey: fs.readFileSync('/home/victor/.ssh/id_deploy_dashboard'),
  passphrase: process.env.PASSPHRASE
});