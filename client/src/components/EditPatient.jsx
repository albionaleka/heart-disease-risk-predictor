import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const EditPatient = ({ onSuccess }) => {
  const { backend } = useContext(AppContext);
  const navigate = useNavigate();
  const { patientId } = useParams(); // <-- get patientId from params

  const [form, setForm] = useState(() => ({
    name: '',
    age: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    medicalHistory: ''
  }));

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        try {
          const res = await fetch(`${backend}/api/patient/${patientId}`);
          const data = await res.json();
          if (data.success && data.patientData) {
            const p = data.patientData;
            setForm({
              name: p.name || '',
              age: p.age || '',
              gender: p.gender || '',
              contactNumber: p.contactNumber || '',
              email: p.email || '',
              address: p.address || '',
              medicalHistory: p.medicalHistory || ''
            });
          }
        } catch (err) {
          toast.error('Failed to load patient');
        }
      };
      fetchPatient();
    }
  }, [patientId, backend]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('No patient id provided for update');
      return;
    }
    try {
      const res = await fetch(`${backend}/api/patient/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        if (onSuccess) onSuccess(data.patientData || data.updatedPatient || data.patient);
        navigate('/patients');
        toast.success('Patient updated successfully!');
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (err) {
      toast.error('An error occurred while updating the patient.');
    }
  };

  return (
    <div className="w-full flex items-center flex-col">
      <div className="mb-3 w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
        <h2 className="text-2xl font-bold mb-4">Edit Patient</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" style={{ color: 'var(--app-text)' }} required />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" style={{ color: 'var(--app-text)' }} required />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
              style={{ color: 'var(--app-text)' }}
              required
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Contact Number</label>
            <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" style={{ color: 'var(--app-text)' }} />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" style={{ color: 'var(--app-text)' }} />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" style={{ color: 'var(--app-text)' }} />
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="mb-1 font-medium">Medical History</label>
            <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" style={{ color: 'var(--app-text)' }} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <button type="submit" className="w-full rounded-lg font-bold py-2 px-4 shadow card transition-all mt-2" style={{background:'var(--accent)', color:'#fff'}} onMouseEnter={e=>e.currentTarget.style.background='var(--accent-hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--accent)'}>Update</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default EditPatient