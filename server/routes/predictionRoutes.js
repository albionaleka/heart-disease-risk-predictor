import express from "express";
import { predictHeartRisk, getDashboardStats, getPatientPredictionHistory } from "../controllers/predictionController.js";

const predictionRouter = express.Router();

predictionRouter.post("/predict", predictHeartRisk);
predictionRouter.get("/dashboard", getDashboardStats);
predictionRouter.get("/history/:patientId", getPatientPredictionHistory);

export default predictionRouter;