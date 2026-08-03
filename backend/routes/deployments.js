import express from "express";
import Deployment from "../schemas/deployment.js";
import { runStepTemp, runStepPerm } from "../deployment/runLocal.js";

const routes = express.Router();

routes.get('/', async (req, res) => {
    let data = await Deployment.find();

    if (data.length === 0) {
        return res.status(404).json({ message: 'No deployments found' });
    }

    res.status(200).json(data);
})

routes.get('/deployment', async (req, res) => {
    let data = await Deployment.findOne({ _id: req.query.id });

    if (data === null) {
        return res.status(404).json({ message: 'Deployment not found' })
    }

    res.status(200).json(data);
})

routes.post('/newDeployment', async (req, res) => {
    let data = req.body;

    req.body.targetType === 'local' ?
        data.localPath = req.body.path
        : data.remotePath = req.body.path

    try {
        let deployment = await Deployment.create(data)
        let id = deployment._id;
        res.status(200).json({ message: 'Deployment successfully created', id: id })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured' });
    }
})


routes.put('/deployment', async (req, res) => {
    try {
        await Deployment.updateOne({ _id: req.query.id }, { $set: req.body })
        res.status(200).json({ message: 'Deployment updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured' })
    }

})

routes.post('/deploy', async (req, res) => {
    let deployment = await Deployment.findOne({ _id: req.query.id })
    let basePath = deployment.targetType === 'local' ? deployment.localPath : deployment.remotePath

    let data = {};

    try {
        for (let step of deployment.steps) {

            data.temp = await runStepTemp(basePath, step.subPath);

            if(data.temp.exitCode !== 0 ){
                throw new Error(`Temp step failed with code ${data.temp.exitCode}`)
            }

            data.perm = await runStepPerm(basePath, step.subPath, step.command);
        }
        
        // await Deployment.updateOne({_id: req.query.id}, {lastRunStatus: data.perm.status})
        res.status(200).json({ message: 'Success! Website is up and running', status: data.perm.status, logs: data.perm.logs})
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Deployment failed', error: err })
    }
});



export default routes;