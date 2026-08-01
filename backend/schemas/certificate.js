import { Schema, model } from "mongoose";

const certificate = new Schema({
    websiteId: {type: Schema.Types.ObjectId, ref: 'Website', required: true},
    hostname: {type: String, required: true},
    validFrom: {type: Date, required: true },
    validTo: {type: Date, required: true},
    valid: {type: Boolean, required: true},
    authError: {type: String, required: false},
    issuer: {
        O: {type: String, required: false},
        CN: {type: String, required: false},
    }
}, { timestamps: true });

const Certificate = model('Certificate', certificate);
export default Certificate;