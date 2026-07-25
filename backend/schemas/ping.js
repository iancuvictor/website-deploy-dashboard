import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ping = new Schema({
    websiteId: {type: Schema.Types.ObjectId, ref: 'Website', required: true},
    responseTime: {type: Number, required: true},
    status: {type: Boolean, required: true},
}, {
    timestamps: true
});

const Ping = model('Ping', ping);
export default Ping;