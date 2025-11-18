import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { FaEdit, FaTrash, FaCalculator, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PatientRecords = () => {
    const [records, setRecords] = useState([]);
    const { backend } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get(`${backend}/api/patient`);
                setRecords(response.data.patients);
            } catch (error) {
                toast.error("Error fetching patient records: " + error.message);  
            }
        };

        fetchRecords();
    }, []);

    const handleDelete = async (patientId) => {
        try {
            await axios.delete(`${backend}/api/patient/${patientId}`);
            setRecords(records.filter(record => record._id !== patientId));
            toast.success("Patient record deleted successfully");
        } catch (error) {
            toast.error("Error deleting patient record");
            console.error("Error deleting patient record:", error);
        }
    };

    const handleEdit = (patientId) => {
        navigate(`/edit-patient/${patientId}`);
    }

    const getAppointmentStatus = (patient) => {
        if (!patient || patient.heartRiskScore < 0.5 || !patient.lastCheckup) return null;
        const lastCheckup = new Date(patient.lastCheckup);
        const nextAppointment = new Date(lastCheckup);
        nextAppointment.setDate(nextAppointment.getDate() + 28);
        const today = new Date();
        const daysUntil = Math.ceil((nextAppointment - today) / (1000 * 60 * 60 * 24));
        if (daysUntil < 0) return { type: 'overdue', days: Math.abs(daysUntil) };
        if (daysUntil <= 7) return { type: 'due', days: daysUntil };
        return null;
    };

    return (
        <div className="w-full flex items-center flex-col mt-auto">
            <div className="mb-3 w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold mb-4">Patient Records</h2>
                    <button onClick={() => window.location.href = "/add-patient"} className="px-4 py-2 rounded-lg font-semibold transition-all card flex items-center gap-2" style={{background:'var(--accent)', color:'#fff'}} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}><FaPlus /> Add Patient</button>
                </div>
                {records.length === 0 ? (
                    <p className="text-gray-500">No patient records found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Age</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Gender</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => {
                                    const appointmentStatus = getAppointmentStatus(record);
                                    return (
                                        <tr key={record._id || record.id} onClick={() => window.location.href = `/patient/${record._id}`} className="transition-all hover:card-bg-hover cursor-pointer rounded-lg">
                                            <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.age}</td>
                                            <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.gender}</td>
                                            <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.contactNumber}</td>
                                            <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.email}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {appointmentStatus ? (
                                                    <span className="px-2 py-1 rounded text-xs font-semibold" style={{
                                                        background: appointmentStatus.type === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        color: appointmentStatus.type === 'overdue' ? '#ef4444' : '#f59e0b',
                                                        border: `1px solid ${appointmentStatus.type === 'overdue' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                                    }}>
                                                        {appointmentStatus.type === 'overdue' ? `⚠️ Overdue ${appointmentStatus.days}d` : `📅 Due in ${appointmentStatus.days}d`}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs font-semibold" style={{
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        color: '#f59e0b',
                                                        border: '1px solid rgba(245, 158, 11, 0.3)'
                                                    }}>
                                                        No appointment scheduled
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleEdit(record._id || record.id)} className="mr-2 rounded-lg text-lg px-2 py-1 font-bold transition-all" title="Edit"><FaEdit /></button>
                                                <button onClick={() => handleDelete(record._id || record.id)} className="rounded-lg text-lg px-2 py-1 font-bold transition-all" title="Delete"><FaTrash /></button>
                                                <button onClick={() => navigate(`/heart-risk/${record._id}`)} className="ml-2 rounded-lg text-lg px-2 py-1 font-bold transition-all" title="Calculate Heart Risk"><FaCalculator /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PatientRecords