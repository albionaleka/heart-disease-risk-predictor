import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const PatientForm = () => {
    const { backend } = useContext(AppContext);
    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: '',
        contactNumber: '',
        email: '',
        address: '',
        medicalHistory: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const nav = (path) => {
        window.location.href = path;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(backend + '/api/patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Patient created successfully!');
                setForm({
                    name: '',
                    age: '',
                    gender: '',
                    contactNumber: '',
                    email: '',
                    address: '',
                    medicalHistory: ''
                });
                nav("/patients");
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while creating the patient.');
        }
    };

    return (
        <div className="w-full p-4 flex items-center flex-col mt-4">
            <div className="mb-3 w-full md:w-2/3 mx-auto p-6 shadow rounded-lg" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
                <h2 className="text-2xl font-bold mb-4">Patient Form</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Gender</label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Contact Number</label>
                        <input
                            type="text"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 flex flex-col">
                        <label className="mb-1 font-medium">Medical History</label>
                        <textarea
                            name="medicalHistory"
                            value={form.medicalHistory}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <button
                            type="submit"
                            className="w-full rounded-lg font-bold py-2 px-4 shadow card transition-all mt-2" style={{ background: 'var(--accent)', color: '#fff' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PatientForm