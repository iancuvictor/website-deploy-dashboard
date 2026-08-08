import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const log = new Schema({
    stepId: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, expires: 86400 }
}, {
    timestamps: true
});

const Log = model('Log', log);
export default Log;