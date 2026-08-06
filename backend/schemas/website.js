import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const website = new Schema({    
    name: {type: String, required: true},
    url: {type: String, required: true},
    pingFrequency: {type: Number, min: [1, `Ping frequency cannot be 0 or negative`], required: true},
    pinging: {type: Boolean, default: true, required: true},
    certFrequency: {type: Number, min: [1, `Cert frequency cannot be 0 or negative`], default: 1, required: true},
    certPinging: {type: Boolean, default: true, required: true},
    stepId: {type: Schema.Types.ObjectId, default: null},
    deploymentId: {type: Schema.Types.ObjectId, default: null},
});

const Website = model('Website', website);

export default Website;