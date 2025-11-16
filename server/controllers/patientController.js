import Patient from "../models/patient.js";
import Test from "../models/test.js";

export const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        return res.json({ success: true, patients });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPatientData = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        // Get test history for this patient from Test collection
        const testHistory = await Test.find({ patientId })
            .sort({ createdAt: -1 })
            .select('-__v')
            .limit(10); // Get last 10 tests

        return res.json({ 
            success: true, 
            patientData: patient,
            testHistory: testHistory || [],
            predictionHistory: testHistory || [] // Keep for backward compatibility
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createPatient = async (req, res) => {
    try {
        const { name, age, gender, contactNumber, email, address, medicalHistory, heartRiskScore } = req.body;

        const newPatient = new Patient({
            name,
            age,
            gender,
            contactNumber,
            email,
            address,
            medicalHistory,
            heartRiskScore
        });

        await newPatient.save();
        return res.status(201).json({ success: true, patientData: newPatient });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const updates = req.body;
        const updatedPatient = await Patient.findByIdAndUpdate(patientId, updates, { new: true });

        if (!updatedPatient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        return res.json({ success: true, patientData: updatedPatient });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const deletedPatient = await Patient.findByIdAndDelete(patientId);
        if (!deletedPatient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        return res.json({ success: true, message: "Patient deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addHeartRiskScore = async (patientId, score) => {
    try {
        const patient = await Patient.findById(patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }
        patient.heartRiskScore = score;
        await patient.save();
        return patient;
    } catch (error) {
        throw new Error(error.message);
    }
};

export default {
    getPatientData,
    createPatient,
    updatePatient,
    addHeartRiskScore,
    deletePatient,
    getPatients
};