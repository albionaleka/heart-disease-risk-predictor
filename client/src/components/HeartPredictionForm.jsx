import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import HeartRiskCard from './HeartRiskCard';
import { toast } from 'react-toastify';

const HeartPredictionForm = ({ patientId }) => {
  const [form, setForm] = useState({
    age: '',
    sex: '', // this is 0 for female, 1 for male (from gender)
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    restecg: '',
    thalach: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
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
      const restFields = ['cp','trestbps','chol','fbs','restecg','thalach','exang','oldpeak','slope','ca','thal'];
      
      restFields.forEach(f => {
        if (apiForm[f] !== undefined && apiForm[f] !== "") apiForm[f] = Number(apiForm[f]);
      });

      // Include patientId in the prediction request
      if (patientId) {
        apiForm.patientId = patientId;
      }

      const res = await fetch(backend + '/api/prediction/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiForm)
      });

      const data = await res.json();
      setResult({ probability: data.probability, label: data.label });
      
      if (patientId && data.probability !== undefined) {
        toast.success('Prediction saved! The new risk score has been updated and added to test history.');
        // Refresh the page to show updated patient data with new prediction
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to predict heart disease risk.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-start p-6 md:items-stretch justify-center gap-6">
      <div className="w-full md:w-2/3 p-6 shadow rounded-lg" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
        <h2 className="text-2xl font-bold mb-4">Heart Disease Risk Prediction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              disabled
              className="border border-gray-300 rounded px-3 py-2 bg-gray-200 text-gray-600 cursor-not-allowed"
              style={{ color: 'var(--app-text)' }}
              required
              readOnly
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Sex (0=Female, 1=Male)</label>
            <input
              type="number"
              name="sex"
              value={form.sex}
              disabled
              className="border border-gray-300 rounded px-3 py-2 bg-gray-200 text-gray-600 cursor-not-allowed"
              required
              readOnly
            />
          </div>
          {/* Render all remaining fields from form, except age and sex */}
          {Object.keys(form)
            .filter(key => key !== 'age' && key !== 'sex')
            .map((key) => (
              <div key={key} className="flex flex-col">
                <label className="mb-1 font-medium capitalize">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                  style={{ color: 'var(--app-text)' }}
                  required
                />
              </div>
            ))}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
          <div className="w-full text-center text-gray-500">Prediction result will appear here</div>
        )}
      </div>
    </div>
  );
};

export default HeartPredictionForm;
