import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import HeartRiskCard from './HeartRiskCard';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const HeartPredictionForm = () => {
  const { id, patientId: routePatientId } = useParams();
  const navigate = useNavigate();
  const patientId = id || routePatientId;
  const [form, setForm] = useState({
    age: '', sex: '', cp: '', trestbps: '', chol: '', fbs: '', restecg: '', thalach: '', exang: '', oldpeak: '', slope: '', ca: '', thal: ''
  });
  const { backend } = useContext(AppContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetch(`${backend}/api/patient/${patientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.patientData) {
            setForm(prev => ({
              ...prev,
              age: data.patientData.age || '',
              sex: data.patientData.gender === 'male' ? 1 : 0
            }));
          }
        })
        .catch(err => {
          console.error('Failed to fetch patient data:', err);
          toast.error('Failed to load patient data');
        });
    }
  }, [patientId, backend]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const apiForm = { ...form };
      apiForm.age = Number(form.age);
      apiForm.sex = Number(form.sex);
      ['cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'].forEach(f => {
        if (apiForm[f] !== undefined && apiForm[f] !== "") apiForm[f] = Number(apiForm[f]);
      });
      if (patientId) apiForm.patientId = patientId;
      const res = await fetch(backend + '/api/prediction/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiForm)
      });
      const data = await res.json();
      if (!res.ok || data.probability === undefined) {
        throw new Error(data.message || 'Failed to get prediction');
      }
      setResult({ probability: data.probability, label: data.label });
      if (patientId) {
        toast.success('Prediction saved! The new risk score has been updated and added to test history.');
        window.dispatchEvent(new CustomEvent('checkupCompleted', { detail: { patientId } }));
        setTimeout(() => navigate(`/patient/${patientId}`), 2500);
      } else {
        toast.success('Prediction completed successfully!');
      }
    } catch (err) {
      toast.error('Failed to predict heart disease risk: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-start p-6 md:items-stretch justify-center gap-6">
      <div className="w-full md:w-2/3 p-6 shadow rounded-lg" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
        <h2 className="text-2xl font-bold mb-4">Heart Disease Risk Prediction</h2>
        <form onSubmit={handleSubmit} className="md:grid md:grid-cols-2 gap-4">
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              disabled
              className="border rounded-lg px-3 py-2 bg-[var(--card-bg-hover)] cursor-not-allowed"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)', background: 'var(--card-bg-hover)' }}
              required
              readOnly
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium">Sex (0=Female, 1=Male)</label>
            <input
              type="number"
              name="sex"
              value={form.sex}
              disabled
              className="border rounded-lg px-3 py-2 bg-[var(--card-bg-hover)] cursor-not-allowed"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)', background: 'var(--card-bg-hover)' }}
              required
              readOnly
            />
          </div>
          {Object.keys(form)
            .filter(key => key !== 'age' && key !== 'sex')
            .map((key) => (
              <div key={key} className="flex flex-col mb-4">
                <label className="mb-1 font-medium capitalize">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                  style={{ color: 'var(--app-text)', borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}
                  required
                />
              </div>
            ))}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              disabled={loading}
            >
              {loading ? 'Predicting...' : 'Predict'}
            </button>
          </div>
        </form>
      </div>
      <div className="w-full md:w-1/3 flex items-start md:items-center justify-center p-6">
        {result ? (
          <div className="w-full">
            <HeartRiskCard probability={result.probability} label={result.label} />
          </div>
        ) : (
          <div className="w-full text-center" style={{ color: 'var(--text-muted)' }}>Prediction result will appear here</div>
        )}
      </div>
    </div>
  );
}
export default HeartPredictionForm;
