import express from "express";
import { predictHeartRisk, getDashboardStats, getPatientPredictionHistory, getTestById } from "../controllers/predictionController.js";

const predictionRouter = express.Router();

predictionRouter.post("/predict", predictHeartRisk);
predictionRouter.get("/dashboard", getDashboardStats);
predictionRouter.get("/history/:patientId", getPatientPredictionHistory);
predictionRouter.get("/test/:testId", getTestById);

export default predictionRouter;