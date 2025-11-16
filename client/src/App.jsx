import Home from "./views/Home"
import Login from "./views/Login"
import Register from "./views/Register"
import ResetPassword from "./views/ResetPassword"
import VerifyAccount from "./views/VerifyAccount"
import { Route, Routes, Link } from "react-router-dom"
import Patient from "./components/Patient"
import PatientRecords from "./components/PatientRecords"
import HeartPredictionForm from "./components/HeartPredictionForm"
import Dashboard from "./views/Dashboard"
import HeartRisk from "./views/HeartRisk"
import Navbar from "./components/Navbar"
import { ToastContainer } from "react-toastify"
import EditPatient from "./components/EditPatient"
import PatientForm from "./components/PatientForm"

function App() {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen w-full" style={{ background: 'var(--app-bg)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/verify" element={<VerifyAccount />} />
            <Route path="/patient/:patientId" element={<Patient />} />
            <Route path="/add-patient" element={<PatientForm />} />
            <Route path="/edit-patient/:patientId" element={<EditPatient />} />
            <Route path="/patients" element={<PatientRecords />} />
            <Route path="/prediction" element={<HeartPredictionForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prediction/:patientId" element={<HeartPredictionForm />} />
            <Route path="/heart-risk/:patientId" element={<HeartRisk />} />
          </Routes>
        </div>
        <ToastContainer />
      </>
    )
}

export default App
