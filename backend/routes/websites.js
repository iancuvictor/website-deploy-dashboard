import express from 'express';
import Website from '../schemas/website.js';

const routes = express.Router();

routes.get('/', async (req, res) => {
    try{
        let data = await Website.find();
        res.status(200).json(data);
    } catch(err){
        console.log(err);
        res.json({message: `An error has occured when fetching the data`});
    }
});

routes.post('/addWebsite', async (req, res) => {
    try{
        await Website.create(req.body);
        res.status(200).json({message: `Website [${req.body.url}] added`})
    } catch(err) {
        console.log(err);
        res.json({message: `An error has happened`});
    }
});


export default routes;