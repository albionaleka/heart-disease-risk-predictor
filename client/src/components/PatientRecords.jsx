import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { FaEdit, FaTrash, FaCalculator } from "react-icons/fa";
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

    return (
        <div className="w-full flex items-center flex-col mt-auto">
            <div className="mb-3 w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
                <h2 className="text-2xl font-bold mb-4">Patient Records</h2>
                <button onClick={() => window.location.href = "/add-patient"} className="mb-4 px-4 py-2 rounded-lg font-semibold transition-all card" style={{background:'var(--accent)', color:'#fff'}} onMouseEnter={e=>e.currentTarget.style.background='var(--accent-hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--accent)'}>Add Patient</button>

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
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--app-text)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record._id || record.id} onClick={() => window.location.href = `/patient/${record._id}`} className="transition-all hover:card-bg-hover cursor-pointer rounded-lg">
                                        <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.age}</td>
                                        <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.gender}</td>
                                        <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.contactNumber}</td>
                                        <td className="px-4 py-4 whitespace-nowrap" style={{ color: 'var(--app-text)' }}>{record.email}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <button onClick={() => handleEdit(record._id || record.id)} className="mr-2 rounded-lg text-lg px-2 py-1 font-bold transition-all" title="Edit"><FaEdit /></button>
                                            <button onClick={() => handleDelete(record._id || record.id)} className="rounded-lg text-lg px-2 py-1 font-bold transition-all" title="Delete"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PatientRecords