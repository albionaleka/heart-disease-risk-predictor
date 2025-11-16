import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    medicalHistory: {
        type: String,
        default: ""
    },
    heartRiskScore: {
        type: Number,
        default: null
    },
    heartRiskLabel: {
        type: Number,
        default: null
    }       
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;