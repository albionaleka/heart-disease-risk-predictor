import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    sex: {
        type: Number,
        enum: [0, 1], 
        required: true
    },
    cp: {
        type: Number,
        enum: [0, 1, 2, 3], // chest pain type
        required: true
    },
    trestbps: {
        type: Number,
        required: true // resting blood pressure
    },
    chol: {
        type: Number,
        required: true // cholesterol
    },
    fbs: {
        type: Number,
        enum: [0, 1], // fasting blood sugar
        required: true
    },
    restecg: {
        type: Number,
        enum: [0, 1, 2], // resting electrocardiographic results
        required: true
    },
    thalach: {
        type: Number,
        required: true // maximum heart rate achieved
    },
    exang: {
        type: Number,
        enum: [0, 1], // exercise induced angina
        required: true
    },
    oldpeak: {
        type: Number,
        required: true // ST depression
    },
    slope: {
        type: Number,
        enum: [0, 1, 2], // slope of the peak exercise ST segment
        required: true
    },
    ca: {
        type: Number,
        enum: [0, 1, 2, 3], // number of major vessels colored by flourosopy
        required: true
    },
    thal: {
        type: Number,
        enum: [0, 1, 2, 3], // thalassemia
        required: true
    },
    prediction: {
        type: Number,
        required: true // 0 or 1 (no disease / disease)
    },
    probability: {
        type: Number,
        required: true // risk score probability
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
testSchema.index({ patientId: 1, createdAt: -1 });

const Test = mongoose.model('Test', testSchema);
export default Test;

