const HeartRiskCard = ({ probability }) => {
  return (
    <div className="card w-full max-w-xs transition-all">
      <h3 className="text-lg font-semibold mb-2">Heart Disease Risk</h3>
      <p className="text-lg font-bold">Probability: {(probability * 100).toFixed(1)}%</p>
      <p>Risk Level: {probability >= 0.5 ? "High" : "Low"}</p>
    </div>
  );
};

export default HeartRiskCard;
