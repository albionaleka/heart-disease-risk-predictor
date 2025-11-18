import { useContext, useState } from "react";
import { FaUser, FaLock, FaEye } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from 'axios';
import {toast} from 'react-toastify';

const Login = () => {
    const [action, setAction] = useState('Login');

    const {backend, getAuth} = useContext(AppContext);

    const [formData, setFormData] = useState(() => {
        return {
            name: '',
            email: '',
            password: '',
            confirm: ''
        }
    });

    const nav = useNavigate();

    const handleType = (input) => {
        const inp = document.getElementById(input);

        if (inp.type === "password") {
            inp.type = "text";
        } else {
            inp.type = "password";
        }     
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            axios.defaults.withCredentials = true;

            if (action === "Register") {
                if (formData.password === formData.confirm) {
                    const {data} = await axios.post(backend + "/api/auth/register", {
                        name: formData.name,
                        email: formData.email, 
                        password: formData.password
                    });

                    if (data.success) {
                        await getAuth();
                        nav("/");
                    } else {
                        toast.error(data.message);
                    }
                } else {
                    toast.error("Passwords do not match!");
                }
            } else {
                const {data} = await axios.post(backend + "/api/auth/login", {
                    email: formData.email, 
                    password: formData.password
                });

                if (data.success) {
                    await getAuth();
                    nav("/");
                } else {
                    toast.error("Couldn't log you in");
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.error(errorMessage);
        }
    }

    return (
        <div className="bg-slate-800 flex flex-col items-center justify-center min-h-screen px-0 md:px-6">
            <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full md:w-96 text-indigo-300">
                <h2 className="text-3xl text-center font-semibold mb-6">{action === "Login" ? "Login" : "Register"}</h2>

                <form onSubmit={handleSubmit} className="mb-3">
                    {action === "Register" && (
                        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-slate-700">
                            <FaUser />
                            <input type="text" className="bg-transparent outline-none" placeholder="Full Name"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                    )}
                    
                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-slate-700">
                        <IoMdMail />
                        <input type="email" id="email" className="bg-transparent outline-none" placeholder="Email" 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-slate-700">
                        <FaLock />
                        <input type="password" id="password" className="bg-transparent outline-none" placeholder="Password"
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <FaEye onClick={() => handleType("password")} className="hover:text-gray-300 cursor-pointer"/>
                    </div>

                    {action === "Register" && (
                        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-slate-700">
                            <FaLock />
                            <input type="password" id="confirm" className="bg-transparent outline-none" placeholder="Confirm Password"
                                value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required />
                            <FaEye onClick={() => handleType("confirm")} className="hover:text-gray-300 cursor-pointer"/>
                        </div>
                    )} 
                    
                    {action === "Login" && 
                        <p onClick={() => nav("/reset")} className="mb-4 cursor-pointer transition-colors" style={{color: 'var(--accent)'}} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}>Forgot Password?</p>}

                    <button className="w-full py-2 rounded-lg text-white transition-colors" style={{background: 'var(--accent)'}} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>{action === "Register" ? "Signup": "Log in"}</button>
                </form>
                    
                {action === "Register" 
                    ? <p>Already have an account? <span onClick={() => setAction("Login")} className="cursor-pointer underline transition-colors" style={{color: 'var(--accent)'}} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}>Login</span></p>
                    : <p>Don't have an account? <span onClick={() => setAction("Register")} className="cursor-pointer underline transition-colors" style={{color: 'var(--accent)'}} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}>Sign up</span></p>
                }
            </div>
        </div>
    )
}

export default Login