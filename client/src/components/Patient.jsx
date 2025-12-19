import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import HeartRiskCard from "./HeartRiskCard";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Patient = ({ onDelete }) => {
	const { backend } = useContext(AppContext);
	const params = useParams();
	const nav = useNavigate();

	const id = params.patientId;
	const [patient, setPatient] = useState(null);
	const [predictionHistory, setPredictionHistory] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) {
			setPatient(null);
			setLoading(false);
			return;
		}
		setLoading(true);
		fetch(`${backend}/api/patient/${id}`)
			.then(res => res.json())
			.then(data => {
				if (data.success && data.patientData) {
					setPatient(data.patientData);
				} else {
					setPatient(null);
					toast.error("Patient not found");
				}
			})
			.catch(() => {
				setPatient(null);
				toast.error("Failed to fetch patient");
			})
			.finally(() => setLoading(false));
	}, [id, backend]);

	useEffect(() => {
		if (patient && patient._id) {
			fetch(`${backend}/api/prediction/history/${patient._id}`)
				.then(res => res.json())
				.then(data => {
					if (data.success && data.tests) {
						setPredictionHistory(data.tests);
					} else if (data.success && data.predictions) {
						setPredictionHistory(data.predictions);
					} else {
						setPredictionHistory([]);
					}
				})
				.catch(() => {
					setPredictionHistory([]);
					toast.error("Failed to fetch prediction history");
				});
		} else {
			setPredictionHistory([]);
		}
	}, [patient, backend]);

	const handleDelete = async () => {
		if (!patient || !patient._id) {
			return toast.error('No patient selected');
		}
		if (!window.confirm('Delete this patient? This action cannot be undone.')) return;
		try {
			const res = await fetch(`${backend}/api/patient/${patient._id}`, { method: "DELETE" });
			const data = await res.json();
			if (data.success) {
				toast.success("Patient deleted");
				if (onDelete) onDelete(patient._id);
				nav("/patients");
			} else {
				toast.error("Error: " + data.message);
			}
		} catch {
			toast.error("Failed to delete patient");
		}
	};

	const getAppointmentInfo = () => {
		if (!patient || patient.heartRiskScore < 0.5 || !patient.lastCheckup) return null;
		const lastCheckup = new Date(patient.lastCheckup);
		const nextAppointment = new Date(lastCheckup);
		nextAppointment.setDate(nextAppointment.getDate() + 28);
		const today = new Date();
		const daysUntil = Math.ceil((nextAppointment - today) / (1000 * 60 * 60 * 24));
		const isOverdue = daysUntil < 0;
		return { nextAppointment, daysUntil, isOverdue };
	};

	const appointmentInfo = getAppointmentInfo();

	if (loading) return <div className="text-center p-6">Loading patient...</div>;
	if (!patient) return <div className="text-center p-6" style={{ color: 'var(--text-muted)' }}>No patient selected</div>;

	return (
		<div className="w-full flex items-center flex-col p-4">
			<div className="w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
				<div className="md:flex items-start justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold">{patient.name}</h2>
						<p className="text-sm" style={{ color: 'var(--text-muted)' }}>{patient.email}</p>
						<div className="mt-4 grid grid-cols-2 gap-4 text-sm" style={{ color: 'var(--app-text)' }}>
							<div>
								<div className="font-medium" style={{ color: 'var(--text-secondary)' }}>Age</div>
								<div>{patient.age}</div>
							</div>
							<div>
								<div className="font-medium" style={{ color: 'var(--text-secondary)' }}>Gender</div>
								<div>{patient.gender}</div>
							</div>
							<div>
								<div className="font-medium" style={{ color: 'var(--text-secondary)' }}>Contact</div>
								<div>{patient.contactNumber}</div>
							</div>
							<div>
								<div className="font-medium" style={{ color: 'var(--text-secondary)' }}>Address</div>
								<div>{patient.address}</div>
							</div>
							{patient.lastCheckup && (
								<div>
									<div className="font-medium" style={{ color: 'var(--text-secondary)' }}>Last Checkup</div>
									<div>{new Date(patient.lastCheckup).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
								</div>
							)}
							{appointmentInfo && (
								<div>
									<div className="font-medium" style={{ color: 'var(--text-secondary)' }}>Next Appointment</div>
									<div style={{ color: appointmentInfo.isOverdue ? '#ef4444' : appointmentInfo.daysUntil <= 7 ? '#f59e0b' : 'var(--app-text)' }}>
										{appointmentInfo.nextAppointment.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
										{appointmentInfo.isOverdue && <span className="ml-2 text-xs font-semibold">(Overdue)</span>}
										{!appointmentInfo.isOverdue && appointmentInfo.daysUntil <= 7 && <span className="ml-2 text-xs font-semibold">({appointmentInfo.daysUntil} days)</span>}
									</div>
								</div>
							)}
						</div>
						{appointmentInfo && appointmentInfo.isOverdue && (
							<div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
								<p className="text-sm font-semibold" style={{ color: '#ef4444' }}>
									⚠️ Appointment Overdue: This high-risk patient is due for a checkup. Please schedule an appointment.
								</p>
							</div>
						)}
						{appointmentInfo && !appointmentInfo.isOverdue && appointmentInfo.daysUntil <= 7 && (
							<div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
								<p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
									📅 Appointment Reminder: Next checkup in {appointmentInfo.daysUntil} day{appointmentInfo.daysUntil !== 1 ? 's' : ''}.
								</p>
							</div>
						)}

						{patient.medicalHistory && (
							<div className="mt-6">
								<h3 className="font-medium mb-2">Medical History</h3>
								<p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--app-text)' }}>{patient.medicalHistory}</p>
							</div>
						)}
					</div>
					<div className="flex flex-col-reverse md:flex-col md:items-end gap-4 mt-4 md:mt-0">
						<div className="flex gap-2">
							<button onClick={() => window.location.href = `/edit-patient/${patient._id}`} className="rounded-xl px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white">Edit</button>
							<button onClick={() => window.location.href = `/heart-risk/${patient._id}`} className="rounded-xl px-4 py-1 bg-green-600 hover:bg-green-500 text-white">Calculate Heart Risk</button>
							<button onClick={handleDelete} className="rounded-xl px-4 py-1 bg-red-600 hover:bg-red-500 text-white">Delete</button>
						</div>
						<div>
							{patient.heartRiskScore != null ? (
								<div className="w-44">
									<HeartRiskCard probability={patient.heartRiskScore} label={patient.heartRiskLabel ?? 0} />
								</div>
							) : (
								<div style={{ color: 'var(--text-muted)' }}>No risk score</div>
							)}
						</div>
					</div>
				</div>

			</div>

			{predictionHistory.length > 0 && (
				<div className="w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
					<h3 className="text-xl font-bold mb-4">Test Results History</h3>
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr style={{ borderBottom: '1px solid var(--border-color)' }}>
									<th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Date</th>
									<th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Risk Score</th>
									<th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Prediction</th>
									<th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Age</th>
									<th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Cholesterol</th>
									<th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Blood Pressure</th>
								</tr>
							</thead>
							<tbody>
								{predictionHistory.map((pred, index) => {
									const date = new Date(pred.createdAt).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									});
									const riskPercent = (pred.probability * 100).toFixed(1);
									const isHighRisk = pred.probability >= 0.5;
									return (
										<tr
											key={pred._id || index}
											className="hover:card-bg-hover transition-colors cursor-pointer"
											style={{ borderBottom: '1px solid var(--border-color)' }}
											onClick={() => nav(`/test/${pred._id}`)}
											tabIndex={0}
											aria-label="View test details"
										>
											<td className="px-4 py-2 text-sm" style={{ color: 'var(--app-text)' }}>{date}</td>
											<td className="px-4 py-2">
												<span className="font-semibold" style={{ color: isHighRisk ? '#ef4444' : '#22d3ee' }}>{riskPercent}%</span>
											</td>
											<td className="px-4 py-2">
												<span className="text-sm px-2 py-1 rounded" style={{ background: pred.prediction === 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 211, 238, 0.1)', color: pred.prediction === 1 ? '#ef4444' : '#22d3ee' }}>{pred.prediction === 1 ? 'Disease Predicted' : 'Disease Risk not Predicted'}</span>
											</td>
											<td className="px-4 py-2 text-sm" style={{ color: 'var(--app-text)' }}>{pred.age}</td>
											<td className="px-4 py-2 text-sm" style={{ color: 'var(--app-text)' }}>{pred.chol} mg/dL</td>
											<td className="px-4 py-2 text-sm" style={{ color: 'var(--app-text)' }}>{pred.trestbps} mmHg</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};

export default Patient;
