import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const fieldLabels = {
  age: 'Age',
  sex: 'Sex',
  cp: 'Chest Pain Type',
  trestbps: 'Resting BP',
  chol: 'Cholesterol',
  fbs: 'Fasting Blood Sugar',
  restecg: 'Resting ECG',
  thalach: 'Max Heart Rate',
  exang: 'Exercise-induced Angina',
  oldpeak: 'ST Depression',
  slope: 'Slope',
  ca: 'Vessels Colored',
  thal: 'Thalassemia',
  prediction: 'Prediction',
  probability: 'Risk Probability',
  createdAt: 'Created',
};

const TestDetail = () => {
  const { testId } = useParams();
  const { backend } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backend}/api/prediction/test/${testId}`);
        const result = await res.json();
        if (!result.success) throw new Error(result.message);
        setData(result.test);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (testId) fetchTest();
  }, [testId, backend]);

  if (loading) return <div className="flex justify-center p-6 font-semibold">Loading test result...</div>;
  if (error || !data)
    return <div className="flex justify-center p-6 text-red-500 font-semibold">{error ? error : 'Test data could not be retrieved.'}</div>;

  return (
    <div className="w-full flex items-center flex-col">
      <div className="w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
        <h2 className="text-2xl font-bold mb-4">Test Details</h2>
        <table className="min-w-full text-left">
          <tbody>
            {Object.entries(data).map(([key, val]) => {
              if (['_id', '__v', 'patientId'].includes(key)) return null;
              let v = val;
              if (key === 'createdAt') v = new Date(val).toLocaleString();
              if (key === 'probability') v = (Number(val) * 100).toFixed(1) + '%';
              if (key === 'prediction') v = val === 1 ? 'Disease Detected' : 'No Disease';
              return (
                <tr key={key} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="py-2 pr-6 font-medium" style={{ color: 'var(--text-secondary)' }}>{fieldLabels[key] || key}</td>
                  <td className="py-2">{v}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default TestDetail;
