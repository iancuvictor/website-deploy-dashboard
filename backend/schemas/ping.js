import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ping = new Schema({
    siteId: {type: Schema.Types.ObjectId, ref: 'Website', required: true},
    responseTime: {type: Number, required: true},

}, {
    timestamps: true
});

const Ping = model('Ping', ping);
export default Ping;