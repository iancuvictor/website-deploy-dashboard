import { Schema, model } from 'mongoose';

const deployment = new Schema({
    name: { type: String, required: true },
    targetType: { type: String, enum: ['local', 'remote'], required: true },
    deploymentUrl: { type: String, default: null },

    localPath: { type: String, default: null }, 

    host: { type: String, default: null },
    port: { type: Number, default: 22 },
    username: { type: String, default: null },
    privateKeyPath: { type: String, default: null },
    remotePath: { type: String, default: null },

    steps: [{
        subPath: { type: String, default: '' },
        command: { type: String, required: true },
    }],

    lastRunStatus: { type: String, enum: ['success', 'failed', 'running', null], default: null },
    lastRunAt: { type: Date, default: null },
    lastRunOutput: { type: String, default: null },
}, { timestamps: true });

const Deployment = model('Deployment', deployment);
export default Deployment;