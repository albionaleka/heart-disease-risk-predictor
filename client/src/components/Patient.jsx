import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import HeartRiskCard from "./HeartRiskCard";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Patient = ({ patient: initialPatient, id, onDelete }) => {
	const { backend } = useContext(AppContext);
	const { patientId } = useParams();
	const [patient, setPatient] = useState(initialPatient || null);
	const [predictionHistory, setPredictionHistory] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		console.log(patientId)
        const currentId = patientId || initialPatient?._id || id;
		if (!patient && currentId) {
			setLoading(true);
			console.log('Fetching patient with id:', currentId);
			fetch(`${backend}/api/patient/${currentId}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.success && data.patientData) {
						setPatient(data.patientData);
						// Use testHistory if available, otherwise fall back to predictionHistory
						if (data.testHistory) {
							setPredictionHistory(data.testHistory);
						} else if (data.predictionHistory) {
							setPredictionHistory(data.predictionHistory);
						}
					}
				})
				.catch(() => toast.error('Failed to fetch patient'))
				.finally(() => setLoading(false));
		} else if (patient && !predictionHistory.length) {
			// Fetch test history if we have patient but no history
			const currentId = patientId || patient._id || id;
			if (currentId) {
				fetch(`${backend}/api/prediction/history/${currentId}`)
					.then((res) => res.json())
					.then((data) => {
						// Use tests if available, otherwise fall back to predictions
						if (data.success && data.tests) {
							setPredictionHistory(data.tests);
						} else if (data.success && data.predictions) {
							setPredictionHistory(data.predictions);
						}
					})
					.catch(() => console.error('Failed to fetch test history'));
			}
		}
	}, [patientId, backend, patient, predictionHistory.length, id, initialPatient]);

	const handleDelete = async () => {
        const currentId = id || patientId;
		const patientIdToDelete = (patient && (patient._id || patient.id)) || currentId;
		if (!patientIdToDelete) return toast.error('No patient selected');

		if (!confirm('Delete this patient? This action cannot be undone.')) return;

		try {
			const res = await fetch(`${backend}/api/patient/${patientIdToDelete}`, {
				method: 'DELETE'
			});
			const data = await res.json();
			if (data.success) {
				toast.success('Patient deleted');
				if (onDelete) onDelete(patientIdToDelete);
			} else {
				toast.error('Error: ' + data.message);
			}
		} catch (err) {
			console.error(err);
			toast.error('Failed to delete patient');
		}
	};

	if (loading) return <div className="text-center p-6">Loading patient...</div>;

	if (!patient) return <div className="text-center p-6 text-gray-500">No patient selected</div>;

	return (
		<div className="w-full flex items-center flex-col">
			<div className="mb-3 w-full md:w-2/3 mx-auto p-6 shadow rounded-lg mt-6" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold">{patient.name}</h2>
						<p className="text-sm text-gray-500">{patient.email}</p>
						<div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
							<div>
								<div className="font-medium text-gray-600">Age</div>
								<div>{patient.age}</div>
							</div>
							<div>
								<div className="font-medium text-gray-600">Gender</div>
								<div>{patient.gender}</div>
							</div>
							<div>
								<div className="font-medium text-gray-600">Contact</div>
								<div>{patient.contactNumber}</div>
							</div>
							<div>
								<div className="font-medium text-gray-600">Address</div>
								<div>{patient.address}</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col items-end gap-4">
						<div className="flex gap-2">
							<button onClick={() => window.location.href = `/edit-patient/${patient._id}`} className="rounded-full px-4 py-1 font-bold shadow card transition-all" style={{background:'var(--accent)',color:'#fff'}} onMouseEnter={e=>e.currentTarget.style.background='var(--accent-hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--accent)'}>Edit</button>
							<button onClick={() => window.location.href = `/heart-risk/${patient._id}`} className="rounded-full px-4 py-1 font-bold shadow card transition-all" style={{background:'#22d3ee',color:'#fff',marginLeft:'0.5rem'}} onMouseEnter={e=>e.currentTarget.style.background='#06b6d4'} onMouseLeave={e=>e.currentTarget.style.background='#22d3ee'}>Calculate Heart Risk</button>
							<button onClick={handleDelete} className="rounded-full px-4 py-1 font-bold shadow card transition-all" style={{background:'#ef4444',color:'#fff',marginLeft:'0.5rem'}} onMouseEnter={e=>e.currentTarget.style.background='#dc2626'} onMouseLeave={e=>e.currentTarget.style.background='#ef4444'}>Delete</button>
						</div>

						{patient.heartRiskScore != null ? (
							<div className="w-44">
								<HeartRiskCard probability={patient.heartRiskScore} label={patient.heartRiskLabel ?? 0} />
							</div>
						) : (
							<div className="text-gray-500">No risk score</div>
						)}
					</div>
				</div>

				{patient.medicalHistory && (
					<div className="mt-6">
						<h3 className="font-medium mb-2">Medical History</h3>
						<p className="text-sm text-gray-700 whitespace-pre-wrap">{patient.medicalHistory}</p>
					</div>
				)}
			</div>

			{/* Prediction History Section */}
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
											className="hover:card-bg-hover transition-colors"
											style={{ borderBottom: '1px solid var(--border-color)' }}
										>
											<td className="px-4 py-2 text-sm" style={{ color: 'var(--app-text)' }}>{date}</td>
											<td className="px-4 py-2">
												<span 
													className="font-semibold"
													style={{ color: isHighRisk ? '#ef4444' : '#22d3ee' }}
												>
													{riskPercent}%
												</span>
											</td>
											<td className="px-4 py-2">
												<span 
													className="text-sm px-2 py-1 rounded"
													style={{ 
														background: pred.prediction === 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 211, 238, 0.1)',
														color: pred.prediction === 1 ? '#ef4444' : '#22d3ee'
													}}
												>
													{pred.prediction === 1 ? 'Disease Detected' : 'No Disease'}
												</span>
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
