import express from "express";
import Deployment from "../schemas/deployment.js";
import { runStepTemp, runStepPerm } from "../deployment/runLocal.js";
import Backup from "../schemas/backup.js";
import Website from "../schemas/website.js";
import Ping from "../schemas/ping.js";
import Certificate from "../schemas/certificate.js";

const routes = express.Router();

routes.get('/', async (req, res) => {
    let data = await Deployment.find();
    res.status(200).json(data);
})

routes.get('/deployment/:id', async (req, res) => {
    let data = {};
    data.deployment = await Deployment.findOne({ _id: req.params.id });
    data.backups = await Backup.find({ deploymentId: req.params.id });
    data.websites = [];
    for (let step of data.deployment.steps) {
        let websiteData = await Website.findOne({ stepId: step.id })
        if(!websiteData){
            break;
        }
        let pingsData = await Ping.find({ websiteId: websiteData._id }).sort({ createdAt: -1 });
        let lastCert = await Certificate.find({ websiteId: websiteData._id }).sort({ createdAt: -1 })[0];

        let stepWebsiteData = {
            website: websiteData,
            pings: pingsData,
            certificate: lastCert
        }
        data.websites.push(stepWebsiteData);
    }

    if (data.deployment === null) {
        return res.status(404).json({ message: 'Deployment not found' })
    }

    res.status(200).json(data);
})

routes.put('/deployment', async (req, res) => {
    try {
        const deployment = await Deployment.findOneAndUpdate({ _id: req.query.id }, { $set: req.body }, {new: true})
        
        for (let step of deployment.steps) {
            if (step.websiteId === null) {
                let newWebsite = await Website.create({
                    name: deployment.name,
                    url: step.deploymentUrl,
                    pingFrequency: 1,
                    pinging: false,
                    certFrequency: 1,
                    certPinging: false,
                    stepId: step._id,
                    deploymentId: deployment._id
                });
                await Deployment.updateOne({ _id: req.query.id, 'steps._id': step._id }, { 'steps.$.websiteId': newWebsite._id })
            } else {
                await Website.updateOne({ stepId: step._id }, { $set: { url: step.deploymentUrl } })
            }
        }
        res.status(200).json({ message: 'Deployment updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured' })
    }

})

routes.put('/deployment/:id/backup', async (req, res) => {
    try {
        await Deployment.updateOne({ _id: req.params.id }, { $set: { backupLocation: req.body.backupLocation } })
        res.status(200).json({ message: 'Backup data successfully updated' })
    } catch (err) {
        res.status(500).json({ message: 'An error has occured' });
    }
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

routes.post('/deploy', async (req, res) => {
    let deployment = await Deployment.findOne({ _id: req.query.id })
    let basePath = deployment.targetType === 'local' ? deployment.localPath : deployment.remotePath

    let data = {};

    try {
        for (let step of deployment.steps) {

            data.temp = await runStepTemp(basePath, step.subPath);

            if (data.temp.exitCode !== 0) {
                throw new Error(`Temp step failed with code ${data.temp.exitCode}`)
            }

            data.perm = await runStepPerm(basePath, step.subPath, step.command);

            if (data.perm.status === 'crashed') {
                return res.status(500).json({ message: 'Deployment failed' })
            }

            await Deployment.updateOne(
                { _id: req.query.id, 'steps._id': step._id },
                { $set: { 'steps.$.pid': data.perm.pid, 'steps.$.status': data.perm.status } }
            );
        }

        // await Deployment.updateOne({_id: req.query.id}, {lastRunStatus: data.perm.status})
        res.status(200).json({ message: 'Success! Website is up and running', status: data.perm.status, logs: data.perm.logs })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Deployment failed', error: err })
    }
});

routes.post('/stopDeployment', async (req, res) => {
    let deployment = await Deployment.findOne({ _id: req.query.id })

    try {
        for (let step of deployment.steps) {
            if (!step.pid) continue;
            try {
                process.kill(-step.pid, 'SIGTERM');
            } catch (err) {
                console.log(`Step ${step._id} already dead:`, err.message);
            }
            await Deployment.updateOne({ _id: req.query.id, 'steps._id': step._id }, { $set: { 'steps.$.pid': null } })
        }
        res.status(200).json({ message: 'Deployment successfully stopped' })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error has occured', error: err.message })
    }
})

routes.post('/installDependencies', async (req, res) => {
    let deployment = await Deployment.findOne({ _id: req.query.id })
    let basePath = deployment.targetType === 'local' ? deployment.localPath : deployment.remotePath

    try {
        for (let step of deployment.steps) {
            if (!step.dependenciesInstalled) {

                let data = await runStepTemp(basePath, step.subPath);

                if (data.exitCode !== 0) {
                    throw new Error(`Temp step failed with code ${data.exitCode}`)
                }

                await Deployment.updateOne(
                    { _id: req.query.id, 'steps._id': step._id },
                    { $set: { 'steps.$.dependenciesInstalled': true } }
                );
            }
        }

        res.status(200).json({ message: 'Dependencies successfully installed' })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Installing dependencies failed', error: err })
    }
})

routes.post('/deployment/:id/backup', async (req, res) => {
    const deployment = await Deployment.findOne({ _id: req.params.id }, { backupLocation: 1 }).lean();
    const mostRecent = await Backup.find().sort({ _id: -1 }).limit(1);

    if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
    }

    let backupLocation = deployment.backupLocation;

    try {
        await Backup.create({
            deploymentId: deployment._id,
            path: backupLocation,
            active: false,
        })
        await Backup.updateOne({ _id: mostRecent._id }, { $set: { active: true } })
        res.status(200).json({ message: 'Backup successfully created' })
    } catch (err) {
        res.status(500).json({ message: 'An error has occured' })
    }
})

routes.delete('/deployment', async (req, res) => {
    try{
        await Backup.deleteMany({deploymentId: req.query.id});
        
        let websites = await Website.find({deploymentId: req.query.id})
        for(let website of websites){
            await Ping.deleteMany({websiteId: website._id})
            await Certificate.deleteMany({websiteId: website._id});
        }
        await Website.deleteMany({deploymentId: req.query.id});
        await Deployment.deleteOne({_id: req.query.id});
        res.status(200).json({message: 'Deployment deleted'});
    } catch(err) {
        res.status(500).json({message: 'An error has occured'});
    }
})


export default routes;