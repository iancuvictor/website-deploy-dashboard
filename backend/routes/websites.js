import express from 'express';
import Website from '../schemas/website.js';
import Ping from '../schemas/ping.js';
import Certificate from '../schemas/certificate.js';

const routes = express.Router();

routes.get('/', async (req, res) => {
    try {
        let websites = await Website.find();
        let data = await Promise.all(websites.map(async (website) => {
            const latestPing = await Ping.findOne({ websiteId: website._id }).sort({ createdAt: -1 });
            return { ...website.toObject(), latestPing }
        }))
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `An error has occured when fetching the data` });
    }
});

routes.get('/website', async (req, res) => {
    try {
        let websiteData = await Website.findOne({ _id: req.query.id })
        let pingsData = await Ping.find({ websiteId: req.query.id })
        let certData = await Certificate.find({ websiteId: req.query.id })

        let data = {
            website: websiteData,
            pings: pingsData,
            certificate: certData
        }
        
        if (data.website !== null) {
            res.status(200).json(data)
        } else {
            res.status(404).json({ message: 'Website data not found' })
        }
    } catch (err) {
        console.log(err);
        if (err instanceof Error) {
            console.log(err.message);
        }
        res.status(500).json({ message: 'An error has occured while fetching the data' });
    }
});

routes.post('/', async (req, res) => {
    let data = {
        name: req.body.name,
        url: req.body.url,
        pingFrequency: req.body.pingFrequency,
        pinging: true
    }
    try {
        await Website.create(data);
        res.status(200).json({ message: `Website [${req.body.url}] added` })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `An error has happened` });
    }
});

routes.put('/', async (req, res) => {
    try {
        await Website.updateOne({ _id: req.body.id }, { $set: req.body });
        res.status(200).json({ message: 'Website updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured' });
    }
})

routes.put('/pinging', async (req, res) => {
    console.log('hit');
    console.log(req.query);
    try{
        if(req.query.pingType === 'ping'){
            await Website.updateOne({_id: req.query.id}, { $set: {pinging: req.body.value}})
            res.status(200).json({message: `Ping status updated to: ${req.body.value}`});
        } else if(req.query.pingType === 'certificate'){
            await Website.updateOne({_id: req.query.id}, { $set: {certPinging: req.body.value}})
            res.status(200).json({message: `Certificate check status updated to: ${req.body.value}`});
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({message: 'An error has occured'});
    }
})

routes.delete('/', async (req, res) => {
    try {
        await Website.deleteOne({
            _id: req.query.id
        })
        await Ping.deleteMany({
            websiteId: req.query.id
        })
        await Certificate.deleteMany({
            websiteId: req.query.id
        })
        res.status(200).json('Website and pings removed');
    } catch (err) {
        console.log(err);
        res.status(500).json('An error has happened');
    }
})

routes.delete('/pings', async (req, res) => {
    try {
        await Ping.deleteMany({ websiteId: req.query.id });
        res.status(200).json(`All pings have been deleted`);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured' });
    }
});

routes.delete('/certificates', async (req, res) => {
    try {
        await Certificate.deleteMany({ websiteId: req.query.id });
        res.status(200).json(`All certificate checks have been deleted`);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured' });
    }
});

export default routes;