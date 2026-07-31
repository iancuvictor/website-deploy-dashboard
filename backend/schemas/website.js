import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const website = new Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    pingFrequency: {type: Number, required: true},
    pinging: {type: Boolean, default: true, required: true},
});

const Website = model('Website', website);

export default Website;