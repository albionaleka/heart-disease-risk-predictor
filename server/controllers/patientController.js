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

        const testHistory = await Test.find({ patientId })
            .sort({ createdAt: -1 })
            .select('-__v')
            .limit(10);

        return res.json({ 
            success: true, 
            patientData: patient,
            testHistory: testHistory || [],
            predictionHistory: testHistory || []
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

export const getAppointmentNotifications = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const highRiskPatients = await Patient.find({
            heartRiskScore: { $gte: 0.5 },
            lastCheckup: { $ne: null }
        });

        const notifications = [];
        
        highRiskPatients.forEach(patient => {
            if (!patient.lastCheckup) return;
            
            const lastCheckup = new Date(patient.lastCheckup);
            const nextAppointment = new Date(lastCheckup);
            nextAppointment.setDate(nextAppointment.getDate() + 28); 

            if (nextAppointment <= threeDaysFromNow) {
                const daysUntil = Math.ceil((nextAppointment - today) / (1000 * 60 * 60 * 24));
                const daysSinceCheckup = Math.floor((today - lastCheckup) / (1000 * 60 * 60 * 24));
                if (daysSinceCheckup < 25) return;
                
                notifications.push({
                    patientId: patient._id,
                    patientName: patient.name,
                    patientEmail: patient.email,
                    nextAppointment: nextAppointment,
                    daysUntil: daysUntil,
                    isOverdue: daysUntil < 0,
                    lastCheckup: patient.lastCheckup
                });
            }
        });

        notifications.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            return a.daysUntil - b.daysUntil;
        });

        return res.json({ success: true, notifications, count: notifications.length });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    getPatientData,
    createPatient,
    updatePatient,
    addHeartRiskScore,
    deletePatient,
    getPatients,
    getAppointmentNotifications
};