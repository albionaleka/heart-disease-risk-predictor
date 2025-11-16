import Home from "./views/Home"
import Login from "./views/Login"
import Register from "./views/Register"
import ResetPassword from "./views/ResetPassword"
import VerifyAccount from "./views/VerifyAccount"
import { Route, Routes, Link } from "react-router-dom"
import { ToastContainer } from "react-toastify"

function App() {
    return (
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/verify" element={<VerifyAccount />} />
        </Routes>

        <ToastContainer />
      </>
    )
}

export default App
