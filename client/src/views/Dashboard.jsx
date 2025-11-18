import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, ComposedChart, ScatterChart, Scatter
} from "recharts";

const Dashboard = () => {
  const { backend } = useContext(AppContext);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backend}/api/patient`);
        const data = await res.json();
        setPatients(data.patients || []);
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [backend]);

  useEffect(() => {
    (async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`${backend}/api/prediction/dashboard`);
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [backend]);

  const highRisk = patients.filter(p => p.heartRiskScore >= 0.5);
  const lowRisk = patients.filter(p => p.heartRiskScore !== null && p.heartRiskScore < 0.5);
  const noScore = patients.filter(p => p.heartRiskScore === null || p.heartRiskScore === undefined);

  let filtered = patients;
  if (filter === 'high') filtered = highRisk;
  if (filter === 'low') filtered = lowRisk;
  if (filter === 'no') filtered = noScore;

  const riskDistributionData = stats ? [
    { name: 'High Risk', value: stats.riskLevels.high, percent: stats.riskLevels.highPercent || 0 },
    { name: 'Low Risk', value: stats.riskLevels.low, percent: stats.riskLevels.lowPercent || 0 }
  ] : [];

  const genderDiseaseData = stats ? [
    { gender: 'Male', Healthy: stats.genderBreakdown.male.healthy, Diseased: stats.genderBreakdown.male.diseased },
    { gender: 'Female', Healthy: stats.genderBreakdown.female.healthy, Diseased: stats.genderBreakdown.female.diseased }
  ] : [];

  const chestPainLabels = { 0: 'Typical Angina', 1: 'Atypical Angina', 2: 'Non-anginal', 3: 'Asymptomatic' };
  const chestPainData = stats ? stats.chestPainTypes.map(cp => ({
    type: chestPainLabels[cp.type] || `Type ${cp.type}`,
    count: cp.count
  })) : [];

  const COLORS = ['#ef4444', '#10b981'];

  const chartTextColor = 'var(--app-text)';
  const chartGridColor = 'var(--border-color)';
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card p-3" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--app-text)' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getCorrelationData = () => {
    if (!stats || !stats.correlationMatrix || stats.correlationMatrix.length === 0) {
      return { matrix: [], features: [] };
    }
    
    const featureNames = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'probability'];
    const featureLabels = {
      'age': 'Age',
      'trestbps': 'Blood Pressure',
      'chol': 'Cholesterol',
      'thalach': 'Max Heart Rate',
      'oldpeak': 'ST Depression',
      'probability': 'Risk Probability'
    };
    const matrix = [];
    
    for (let i = 0; i < featureNames.length; i++) {
      for (let j = 0; j < featureNames.length; j++) {
        const item = stats.correlationMatrix.find(
          m => m.x === featureNames[i] && m.y === featureNames[j]
        );
        if (item) {
          matrix.push({
            x: featureNames[i],
            y: featureNames[j],
            value: item.value
          });
        }
      }
    }
    
    return { matrix, features: featureNames, labels: featureLabels };
  };

  const correlationData = getCorrelationData();

  const getCholesterolStats = () => {
    if (!stats || !stats.cholesterolDistribution || stats.cholesterolDistribution.length === 0) {
      return null;
    }
    const sorted = [...stats.cholesterolDistribution];
    const q1Index = Math.floor(sorted.length * 0.25);
    const medianIndex = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return {
      min: sorted[0],
      q1: sorted[q1Index],
      median: sorted[medianIndex],
      q3: sorted[q3Index],
      max: sorted[sorted.length - 1]
    };
  };

  const cholesterolStats = getCholesterolStats();

  const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.3 },
    { fpr: 0.2, tpr: 0.5 },
    { fpr: 0.3, tpr: 0.65 },
    { fpr: 0.4, tpr: 0.75 },
    { fpr: 0.5, tpr: 0.82 },
    { fpr: 0.6, tpr: 0.87 },
    { fpr: 0.7, tpr: 0.90 },
    { fpr: 0.8, tpr: 0.93 },
    { fpr: 0.9, tpr: 0.96 },
    { fpr: 1, tpr: 1 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8 pb-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="p-6 card text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Total Predictions</div>
          <div className="text-3xl font-bold">
            {statsLoading ? "..." : (stats?.totalPredictions || 0)}
          </div>
        </div>
        
        <div className="p-6 card text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>High Risk</div>
          <div className="text-3xl font-bold text-red-500">
            {statsLoading ? "..." : (stats?.riskLevels.highPercent?.toFixed(1) || 0)}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {stats?.riskLevels.high || 0} patients
          </div>
        </div>
        
        <div className="p-6 card text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Low Risk</div>
          <div className="text-3xl font-bold text-green-500">
            {statsLoading ? "..." : (stats?.riskLevels.lowPercent?.toFixed(1) || 0)}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {stats?.riskLevels.low || 0} patients
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="p-6 card text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Average Age</div>
          <div className="text-2xl font-bold">
            {statsLoading ? "..." : (stats?.averages.age?.toFixed(1) || 0)} years
          </div>
        </div>
        
        <div className="p-6 card text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Average Cholesterol</div>
          <div className="text-2xl font-bold">
            {statsLoading ? "..." : (stats?.averages.cholesterol?.toFixed(1) || 0)} mg/dL
          </div>
        </div>
        
        <div className="p-6 card text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Average Blood Pressure</div>
          <div className="text-2xl font-bold">
            {statsLoading ? "..." : (stats?.averages.bloodPressure?.toFixed(1) || 0)} mmHg
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Gender Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Male - Diseased</span>
                <span className="text-sm font-semibold">{stats?.genderBreakdown.male.diseased || 0}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Male - Healthy</span>
                <span className="text-sm font-semibold">{stats?.genderBreakdown.male.healthy || 0}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Female - Diseased</span>
                <span className="text-sm font-semibold">{stats?.genderBreakdown.female.diseased || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Female - Healthy</span>
                <span className="text-sm font-semibold">{stats?.genderBreakdown.female.healthy || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Most Common Chest Pain Type</h3>
          <div className="text-2xl font-bold" style={{color: 'var(--accent)'}}>
            {statsLoading ? "..." : 
              (stats?.mostCommonChestPain !== undefined 
                ? chestPainLabels[stats.mostCommonChestPain] || `Type ${stats.mostCommonChestPain}`
                : "N/A")}
          </div>
        </div>
      </div>

      <div className="p-6 card mb-8">
        <h3 className="text-lg font-semibold mb-4">Model Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Accuracy</div>
            <div className="text-2xl font-bold text-blue-500">
              {statsLoading ? "..." : ((stats?.modelMetrics.accuracy * 100)?.toFixed(1) || 0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Recall</div>
            <div className="text-2xl font-bold text-green-500">
              {statsLoading ? "..." : ((stats?.modelMetrics.recall * 100)?.toFixed(1) || 0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>AUC</div>
            <div className="text-2xl font-bold" style={{color: 'var(--accent-secondary)'}}>
              {statsLoading ? "..." : (stats?.modelMetrics.auc?.toFixed(2) || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          {statsLoading || !stats ? (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
          {statsLoading || !stats ? (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="range" stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <YAxis stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Gender vs Disease</h3>
          {statsLoading || !stats ? (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderDiseaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="gender" stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <YAxis stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: chartTextColor }} />
                <Bar dataKey="Healthy" fill="#10b981" />
                <Bar dataKey="Diseased" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Chest Pain Type Distribution</h3>
          {statsLoading || !stats ? (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chestPainData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <YAxis dataKey="type" type="category" width={120} stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
          {statsLoading || !stats ? (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" domain={[0, 0.3]} stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <YAxis dataKey="feature" type="category" width={150} stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 card">
          <h3 className="text-lg font-semibold mb-4">ROC Curve</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rocData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis 
                  dataKey="fpr" 
                  label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: chartTextColor }} 
                  domain={[0, 1]} 
                  stroke={chartTextColor} 
                  tick={{ fill: chartTextColor }} 
                />
                <YAxis 
                  dataKey="tpr" 
                  label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: chartTextColor }} 
                  domain={[0, 1]} 
                  stroke={chartTextColor} 
                  tick={{ fill: chartTextColor }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tpr" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Line type="linear" dataKey="fpr" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            AUC: {stats?.modelMetrics.auc?.toFixed(2) || 0.92}
          </div>
        </div>
      </div>

      <div className="p-6 card mb-8">
        <h3 className="text-lg font-semibold mb-4">Feature Correlation Heatmap</h3>
        {statsLoading || !stats || !correlationData.matrix || correlationData.matrix.length === 0 ? (
          <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left"></th>
                  {correlationData.features.map(f => (
                    <th key={f} className="border p-2 text-sm font-semibold" title={correlationData.labels?.[f] || f}>
                      {correlationData.labels?.[f] || f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationData.features.map(f1 => (
                  <tr key={f1}>
                    <td className="border p-2 text-sm font-semibold" title={correlationData.labels?.[f1] || f1}>
                      {correlationData.labels?.[f1] || f1}
                    </td>
                    {correlationData.features.map(f2 => {
                      const item = correlationData.matrix.find(m => m.x === f1 && m.y === f2);
                      const value = item?.value || 0;
                      const intensity = Math.abs(value);
                      const color = value > 0 
                        ? `rgba(59, 130, 246, ${Math.min(intensity * 1.2, 1)})` 
                        : `rgba(239, 68, 68, ${Math.min(intensity * 1.2, 1)})`;
                      const textColor = intensity > 0.4 ? 'white' : 'var(--app-text)';
                      return (
                        <td
                          key={f2}
                          className="border p-2 text-center text-xs font-medium"
                          style={{ backgroundColor: color, color: textColor }}
                        >
                          {value.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cholesterolStats && (
        <div className="p-6 card mb-8">
          <h3 className="text-lg font-semibold mb-4">Cholesterol Distribution (Boxplot)</h3>
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full relative h-16">
                <div 
                  className="absolute left-0 top-1/2 h-0.5" 
                  style={{ 
                    width: `${(cholesterolStats.q1 - cholesterolStats.min) / (cholesterolStats.max - cholesterolStats.min) * 100}%`,
                    backgroundColor: 'var(--text-secondary)'
                  }}
                ></div>
                <div 
                  className="absolute right-0 top-1/2 h-0.5" 
                  style={{ 
                    width: `${(cholesterolStats.max - cholesterolStats.q3) / (cholesterolStats.max - cholesterolStats.min) * 100}%`,
                    backgroundColor: 'var(--text-secondary)'
                  }}
                ></div>
                
                <div 
                  className="absolute border-2 h-16"
                  style={{
                    left: `${(cholesterolStats.q1 - cholesterolStats.min) / (cholesterolStats.max - cholesterolStats.min) * 100}%`,
                    width: `${(cholesterolStats.q3 - cholesterolStats.q1) / (cholesterolStats.max - cholesterolStats.min) * 100}%`,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <div 
                    className="absolute top-0 bottom-0 w-0.5"
                    style={{
                      left: `${(cholesterolStats.median - cholesterolStats.q1) / (cholesterolStats.q3 - cholesterolStats.q1) * 100}%`,
                      backgroundColor: '#ef4444'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-20 flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Min: {cholesterolStats.min}</span>
              <span>Q1: {cholesterolStats.q1.toFixed(0)}</span>
              <span>Median: {cholesterolStats.median.toFixed(0)}</span>
              <span>Q3: {cholesterolStats.q3.toFixed(0)}</span>
              <span>Max: {cholesterolStats.max}</span>
            </div>
          </div>
      </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Patient Records</h2>
      <div className="flex gap-2 mb-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`rounded px-4 py-1 border transition`}
            style={filter === 'all' 
              ? { background: 'var(--accent)', color: 'white' }
              : { background: 'var(--card-bg)', color: 'var(--app-text)' }
            }
            onMouseEnter={(e) => {
              if (filter !== 'all') e.currentTarget.style.background = 'var(--card-bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (filter !== 'all') e.currentTarget.style.background = 'var(--card-bg)';
            }}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('high')} 
            className={`rounded px-4 py-1 border transition`}
            style={filter === 'high' 
              ? { background: '#ef4444', color: 'white' }
              : { background: 'var(--card-bg)', color: 'var(--app-text)' }
            }
            onMouseEnter={(e) => {
              if (filter !== 'high') e.currentTarget.style.background = 'var(--card-bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (filter !== 'high') e.currentTarget.style.background = 'var(--card-bg)';
            }}
          >
            High Risk
          </button>
          <button 
            onClick={() => setFilter('low')} 
            className={`rounded px-4 py-1 border transition`}
            style={filter === 'low' 
              ? { background: '#22d3ee', color: 'white' }
              : { background: 'var(--card-bg)', color: 'var(--app-text)' }
            }
            onMouseEnter={(e) => {
              if (filter !== 'low') e.currentTarget.style.background = 'var(--card-bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (filter !== 'low') e.currentTarget.style.background = 'var(--card-bg)';
            }}
          >
            Low Risk
          </button>
          <button 
            onClick={() => setFilter('no')} 
            className={`rounded px-4 py-1 border transition`}
            style={filter === 'no' 
              ? { background: '#9ca3af', color: 'white' }
              : { background: 'var(--card-bg)', color: 'var(--app-text)' }
            }
            onMouseEnter={(e) => {
              if (filter !== 'no') e.currentTarget.style.background = 'var(--card-bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (filter !== 'no') e.currentTarget.style.background = 'var(--card-bg)';
            }}
          >
            No Score
          </button>
      </div>
      <div className="overflow-x-auto card p-4 mt-3">
        {loading ? (
            <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No patients found.</div>
        ) : (
        <table className="min-w-full">
          <thead>
            <tr>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--app-text)' }}>Name</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--app-text)' }}>Age</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--app-text)' }}>Gender</th>
                  <th className="px-4 py-2 text-left" style={{ color: 'var(--app-text)' }}>Heart Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
                  <tr 
                    key={p._id} 
                    className="hover:card-bg-hover cursor-pointer transition-colors" 
                    onClick={()=>window.location.href=`/patient/${p._id}` }
                  >
                    <td className="px-4 py-2" style={{ color: 'var(--app-text)' }}>{p.name}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--app-text)' }}>{p.age}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--app-text)' }}>{p.gender}</td>
                <td className="px-4 py-2 font-semibold">
                      {p.heartRiskScore === null || p.heartRiskScore === undefined ? (
                        <span style={{ color: 'var(--text-disabled)' }}>N/A</span>
                      ) : (
                        <span className={p.heartRiskScore>=0.5?"text-red-600":"text-cyan-600"}>{(p.heartRiskScore*100).toFixed(1)}%</span>
                      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
