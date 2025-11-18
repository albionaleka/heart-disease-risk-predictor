import Login from "./views/Login"
import ResetPassword from "./views/ResetPassword"
import VerifyAccount from "./views/VerifyAccount"
import { Route, Routes, Navigate } from "react-router-dom"
import Patient from "./components/Patient"
import PatientRecords from "./components/PatientRecords"
import HeartPredictionForm from "./components/HeartPredictionForm"
import Dashboard from "./views/Dashboard"
import HeartRisk from "./views/HeartRisk"
import Navbar from "./components/Navbar"
import { ToastContainer } from "react-toastify"
import EditPatient from "./components/EditPatient"
import PatientForm from "./components/PatientForm"
import TestDetail from "./components/TestDetail";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
    const { isLoggedin } = useContext(AppContext);

    return (
      <>
        {isLoggedin && <Navbar />}
        <div className={isLoggedin ? "pt-20 min-h-screen w-full" : "min-h-screen w-full"} style={{ background: 'var(--app-bg)' }}>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/reset" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/verify" element={
              <ProtectedRoute>
                <VerifyAccount />
              </ProtectedRoute>
            } />

            <Route path="/patient/:patientId" element={
              <ProtectedRoute>
                <Patient />
              </ProtectedRoute>
            } />

            <Route path="/add-patient" element={
              <ProtectedRoute>
                <PatientForm />
              </ProtectedRoute>
            } />

            <Route path="/edit-patient/:patientId" element={
              <ProtectedRoute>
                <EditPatient />
              </ProtectedRoute>
            } />

            <Route path="/patients" element={
              <ProtectedRoute>
                <PatientRecords />
              </ProtectedRoute>
            } />

            <Route path="/prediction" element={
              <ProtectedRoute>
                <HeartPredictionForm />
              </ProtectedRoute>
            } />

            <Route path="/prediction/:patientId" element={
              <ProtectedRoute>
                <HeartPredictionForm />
              </ProtectedRoute>
            } />

            <Route path="/heart-risk/:patientId" element={
              <ProtectedRoute>
                <HeartRisk />
              </ProtectedRoute>
            } />
            
            <Route path="/test/:testId" element={
              <ProtectedRoute>
                <TestDetail />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to={isLoggedin ? "/" : "/login"} replace />} />
          </Routes>
        </div>
        <ToastContainer />
      </>
    )
}

export default App
