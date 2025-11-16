import axios from "axios";
import Prediction from "../models/prediction.js";
import Test from "../models/test.js";
import Patient from "../models/patient.js";

export const predictHeartRisk = async (req, res) => {
  try {
    const { data } = await axios.post("http://localhost:8000/predict", req.body);

    if (data.probability !== undefined && data.label !== undefined) {
      const patientId = req.body.patientId || null;

      if (patientId) {
        const testData = {
          patientId: patientId,
          age: req.body.age,
          sex: req.body.sex,
          cp: req.body.cp,
          trestbps: req.body.trestbps,
          chol: req.body.chol,
          fbs: req.body.fbs,
          restecg: req.body.restecg,
          thalach: req.body.thalach,
          exang: req.body.exang,
          oldpeak: req.body.oldpeak,
          slope: req.body.slope,
          ca: req.body.ca,
          thal: req.body.thal,
          prediction: data.label,
          probability: data.probability
        };

        await Test.create(testData);

        await Patient.findByIdAndUpdate(patientId, { 
          heartRiskScore: data.probability 
        });
      } else {
        const predictionData = {
          patientId: null,
          age: req.body.age,
          sex: req.body.sex,
          cp: req.body.cp,
          trestbps: req.body.trestbps,
          chol: req.body.chol,
          fbs: req.body.fbs,
          restecg: req.body.restecg,
          thalach: req.body.thalach,
          exang: req.body.exang,
          oldpeak: req.body.oldpeak,
          slope: req.body.slope,
          ca: req.body.ca,
          thal: req.body.thal,
          prediction: data.label,
          probability: data.probability
        };
        await Prediction.create(predictionData);
      }
    }

    return res.json(data);

  } catch (err) {
    console.error("Prediction error:", err);
    return res.status(500).json({
      success: false,
      message: "Prediction service unavailable."
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Get all patients with their saved heartRiskScore
    const patients = await Patient.find({ heartRiskScore: { $ne: null } });
    
    if (patients.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalPredictions: 0,
          riskLevels: {
            high: 0,
            low: 0,
            highPercent: 0,
            lowPercent: 0
          },
          averages: {
            age: 0,
            cholesterol: 0,
            bloodPressure: 0
          },
          genderBreakdown: {
            male: { diseased: 0, healthy: 0 },
            female: { diseased: 0, healthy: 0 }
          },
          chestPainTypes: [],
          mostCommonChestPain: 0,
          modelMetrics: {
            accuracy: 0.87,
            recall: 0.85,
            auc: 0.92
          },
          ageDistribution: [],
          featureImportance: [],
          correlationMatrix: [],
          cholesterolDistribution: []
        }
      });
    }

    // Get the latest test result for each patient to get detailed stats
    const patientIds = patients.map(p => p._id);
    let latestTests = [];
    
    if (patientIds.length > 0) {
      try {
        latestTests = await Test.aggregate([
          { $match: { patientId: { $in: patientIds } } },
          { $sort: { createdAt: -1 } },
          { $group: {
            _id: "$patientId",
            latestTest: { $first: "$$ROOT" }
          }},
          { $replaceRoot: { newRoot: "$latestTest" } }
        ]);

        latestTests = latestTests.filter(t => t && t.patientId);
      } catch (err) {
        console.error("Error fetching latest tests:", err);
        latestTests = [];
      }
    }

    // Use patient data with their saved heartRiskScore for risk level stats
    const totalPredictions = patients.length;

    // High risk: >= 0.5, Low risk: < 0.5
    const highRisk = patients.filter(p => p.heartRiskScore >= 0.5).length;
    const lowRisk = patients.filter(p => p.heartRiskScore < 0.5).length;

    // Calculate averages from latest test results
    const testsWithData = latestTests.filter(t => t !== null && t !== undefined);
    const avgAge = testsWithData.length > 0 
      ? testsWithData.reduce((sum, t) => sum + t.age, 0) / testsWithData.length 
      : patients.reduce((sum, p) => sum + p.age, 0) / patients.length;
    const avgChol = testsWithData.length > 0
      ? testsWithData.reduce((sum, t) => sum + t.chol, 0) / testsWithData.length
      : 0;
    const avgBP = testsWithData.length > 0
      ? testsWithData.reduce((sum, t) => sum + t.trestbps, 0) / testsWithData.length
      : 0;

    // Gender breakdown - use latest test results
    const maleWithDisease = testsWithData.filter(t => t.sex === 1 && t.prediction === 1).length;
    const maleHealthy = testsWithData.filter(t => t.sex === 1 && t.prediction === 0).length;
    const femaleWithDisease = testsWithData.filter(t => t.sex === 0 && t.prediction === 1).length;
    const femaleHealthy = testsWithData.filter(t => t.sex === 0 && t.prediction === 0).length;

    // Chest pain types from latest tests
    const chestPainCounts = [0, 1, 2, 3].map(type => ({
      type,
      count: testsWithData.filter(t => t.cp === type).length
    }));
    const mostCommon = chestPainCounts.length > 0 && chestPainCounts.some(c => c.count > 0)
      ? chestPainCounts.reduce((max, curr) => curr.count > max.count ? curr : max)
      : { type: 0, count: 0 };

    // Age distribution from patients
    const ageRanges = [
      { range: "20-30", min: 20, max: 30 },
      { range: "31-40", min: 31, max: 40 },
      { range: "41-50", min: 41, max: 50 },
      { range: "51-60", min: 51, max: 60 },
      { range: "61-70", min: 61, max: 70 },
      { range: "71+", min: 71, max: 150 }
    ];
    const ageDistribution = ageRanges.map(range => ({
      range: range.range,
      count: patients.filter(p => p.age >= range.min && p.age <= range.max).length
    }));

    const featureImportance = [
      { feature: "Chest Pain Type", importance: 0.28 },
      { feature: "Thalassemia", importance: 0.22 },
      { feature: "Vessels Colored", importance: 0.18 },
      { feature: "Max Heart Rate", importance: 0.12 },
      { feature: "ST Depression", importance: 0.10 },
      { feature: "Age", importance: 0.10 }
    ];

    const calculateCorrelation = (x, y) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
      return denominator === 0 ? 0 : numerator / denominator;
    };

    // Use latest test results for correlation matrix
    // Only calculate if we have enough data
    const numericFeatures = testsWithData.length > 0 ? {
      age: testsWithData.map(t => t.age || 0),
      trestbps: testsWithData.map(t => t.trestbps || 0),
      chol: testsWithData.map(t => t.chol || 0),
      thalach: testsWithData.map(t => t.thalach || 0),
      oldpeak: testsWithData.map(t => t.oldpeak || 0),
      probability: patients.map(p => p.heartRiskScore || 0)
    } : {
      age: [],
      trestbps: [],
      chol: [],
      thalach: [],
      oldpeak: [],
      probability: []
    };

    const featureNames = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'probability'];
    const correlationMatrix = numericFeatures.age.length > 0
      ? featureNames.map(f1 => 
          featureNames.map(f2 => ({
            x: f1,
            y: f2,
            value: calculateCorrelation(numericFeatures[f1], numericFeatures[f2])
          }))
        ).flat()
      : [];

    const cholesterolValues = testsWithData.map(t => t.chol).sort((a, b) => a - b);

    const stats = {
      totalPredictions,
      riskLevels: {
        high: highRisk,
        low: lowRisk,
        highPercent: totalPredictions > 0 ? (highRisk / totalPredictions) * 100 : 0,
        lowPercent: totalPredictions > 0 ? (lowRisk / totalPredictions) * 100 : 0
      },
      averages: {
        age: avgAge,
        cholesterol: avgChol,
        bloodPressure: avgBP
      },
      genderBreakdown: {
        male: { diseased: maleWithDisease, healthy: maleHealthy },
        female: { diseased: femaleWithDisease, healthy: femaleHealthy }
      },
      chestPainTypes: chestPainCounts.filter(c => c.count > 0),
      mostCommonChestPain: mostCommon.type,
      modelMetrics: {
        accuracy: 0.87,
        recall: 0.85,
        auc: 0.92
      },
      ageDistribution,
      featureImportance,
      correlationMatrix,
      cholesterolDistribution: cholesterolValues
    };

    return res.json({ success: true, stats });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics."
    });
  }
};

export const getPatientPredictionHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required."
      });
    }

    const tests = await Test.find({ patientId })
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.json({
      success: true,
      tests: tests,
      predictions: tests
    });

  } catch (err) {
    console.error("Get prediction history error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test history."
    });
  }
};

export default { predictHeartRisk, getDashboardStats, getPatientPredictionHistory };