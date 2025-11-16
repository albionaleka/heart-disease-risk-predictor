import express from 'express';
import { getPatientData, createPatient, getPatients, addHeartRiskScore, updatePatient, deletePatient, getAppointmentNotifications } from '../controllers/patientController.js';

const patientRouter = express.Router();
    
patientRouter.get('/notifications', getAppointmentNotifications);
patientRouter.get('/:patientId', getPatientData);
patientRouter.get('/', getPatients);
patientRouter.post('/', createPatient);
patientRouter.put('/:patientId', updatePatient);
patientRouter.delete('/:patientId', deletePatient);
patientRouter.post('/:patientId/heartRisk', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { score } = req.body;
        const updatedPatient = await addHeartRiskScore(patientId, score);
        res.json({ success: true, patientData: updatedPatient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default patientRouter;