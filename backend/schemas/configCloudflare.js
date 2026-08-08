import { Schema, model } from 'mongoose';

const cloudflareConfig = new Schema({
    apiToken: { type: String, required: true },
    zoneId: { type: String, required: true },
    baseDomain: { type: String, required: true },
});

const CloudflareConfig = model('CloudflareConfig', cloudflareConfig)
export default CloudflareConfig;