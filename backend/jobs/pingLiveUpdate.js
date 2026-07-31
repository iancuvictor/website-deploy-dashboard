
import cron from 'node-cron';
import { pingWebsite } from '../utils/ping.js';
import Website from '../schemas/website.js';
import Ping from '../schemas/ping.js';

// export async function pingLiveUpdate(io){
//     cron.schedule(`* 2 * * *`, async () => {
//         let websites = await Website.find();
//         for (let website of websites) {
//             let data = await pingWebsite(website.url);
//             let ping = await Ping.create({ 
//                 websiteId: website._id, 
//                 responseTime: data.responseTime, 
//                 status: data.status === 'up'
//             });
//             io.emit('websiteUpdate', ping)
//         }
//     });
// }

export async function pingLiveUpdate(io) {
    let timePassed = 0;
    cron.schedule(`* * * * *`, async () => {
        const websites = await Website.find();

        for (let website of websites) {
            if (timePassed % website.pingFrequency === 0) {
                let data = await pingWebsite(website.url);
                let ping = await Ping.create({
                    websiteId: website._id,
                    responseTime: data.responseTime,
                    status: data.status === 'up'
                });
                io.emit('websiteUpdate', ping)
            }
        }
        timePassed += 1;
    })
}