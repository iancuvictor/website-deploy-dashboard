import { Schema, model } from 'mongoose';

const backup = new Schema({
    deploymentId: {type: Schema.Types.ObjectId, ref: 'Deployment', required: true},
    path: { type: String, required: true },
    active: { type: Boolean, default: false},
}, {timestamps: true})

const Backup = model('Backup', backup);
export default Backup;