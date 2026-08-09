import axios from 'axios';

async function getPublicIp() {
  const res = await axios.get('https://api.ipify.org?format=json');
  return res.data.ip;
}

export async function upsertDnsRecord(subdomain, config) {
  const publicIp = await getPublicIp();

  const existing = await axios.get(
    `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records?type=A&name=${subdomain}`,
    { headers: { Authorization: `Bearer ${config.apiToken}` } }
  );

  const recordExists = existing.data.result.length > 0;

  if (recordExists) {
    const recordId = existing.data.result[0].id;
    await axios.put(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records/${recordId}`,
      { type: 'A', name: subdomain, content: publicIp, ttl: 1, proxied: false },
      { headers: { Authorization: `Bearer ${config.apiToken}` } }
    );
  } else {
    await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records`,
      { type: 'A', name: subdomain, content: publicIp, ttl: 1, proxied: false },
      { headers: { Authorization: `Bearer ${config.apiToken}` } }
    );
  }

  return { publicIp, updated: recordExists };
}