import HeartPredictionForm from "../components/HeartPredictionForm"
import { useParams } from 'react-router-dom';

const HeartRisk = () => {
  const { patientId } = useParams();
  return (
    <div className="flex items-center flex-col min-h-screen">
      <HeartPredictionForm patientId={patientId} className="w-1/2" />
    </div>
  )
}

export default HeartRisk