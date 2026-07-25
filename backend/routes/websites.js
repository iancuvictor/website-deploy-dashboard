import express from 'express';
import Website from '../schemas/website.js';
import Ping from '../schemas/ping.js';

const routes = express.Router();

routes.get('/', async (req, res) => {
    try {
        let websites = await Website.find();
        let data = await Promise.all(websites.map(async (website) => {
            const latestPing = await Ping.findOne({websiteId: website._id}).sort({ createdAt: -1 });
            return {...website.toObject(), latestPing}
        }))
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `An error has occured when fetching the data` });
    }
});

routes.post('/addWebsite', async (req, res) => {
    try {
        await Website.create(req.body);
        res.status(200).json({ message: `Website [${req.body.url}] added` })
    } catch (err) {
        console.log(err);
        res.json({ message: `An error has happened` });
    }
});

routes.delete('/', async (req, res) => {
    try{
        await Website.deleteOne({
            _id: req.query.id
        })
        await Ping.deleteMany({
            websiteId: req.query.id
        })
        res.status(200).json('Website and pings removed');
    } catch(err) {
        console.log(err);
        res.status(500).json('An error has happened');
    }
})


export default routes;