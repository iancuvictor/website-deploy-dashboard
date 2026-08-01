
import cron from 'node-cron';
import { pingWebsite } from '../utils/ping.js';
import Website from '../schemas/website.js';
import Ping from '../schemas/ping.js';
import getSsl from '../utils/ssl.js';
import Certificate from '../schemas/certificate.js';

export async function pingLiveUpdate(io) {
    let timePassed = 0;
    cron.schedule(`* * * * *`, async () => {
        const websites = await Website.find();

        for (let website of websites) {
            if (timePassed % website.pingFrequency === 0 &&
                website.pinging === true) {
                let data = await pingWebsite(website.url);
                let ping = await Ping.create({
                    websiteId: website._id,
                    responseTime: data.responseTime,
                    status: data.status
                });
                io.emit('websiteUpdate', ping)
            }
            if (timePassed % website.certFrequency === 0 && website.certPinging === true) {

                try {
                    const certificate = await getSsl(website.url);
                    await Certificate.create({
                        websiteId: website._id,
                        hostname: certificate.hostname,
                        validFrom: certificate.validFrom,
                        validTo: certificate.validTo,
                        valid: certificate.valid,
                        authError: certificate.authError,
                        issuer: {
                            O: certificate.issuer?.O,
                            CN: certificate.issuer?.CN,
                        }
                    })
                } catch (err) {
                    console.error(`SSL check failed for ${website.url}:`, err.message);
                }

            }
        }
        timePassed += 1;
    })
}