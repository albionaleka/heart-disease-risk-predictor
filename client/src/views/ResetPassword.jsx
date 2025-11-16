import { useContext, useRef, useState } from "react";
import { FaEye, FaHome, FaLock } from "react-icons/fa"
import { IoMdMail } from "react-icons/io";
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {
    const nav = useNavigate();
    const refs = useRef([]);
    const {backend} = useContext(AppContext);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(0);
    const [password, setPassword] = useState('');

    const [emailSent, setEmailSent] = useState(false);
    const [submitOtp, setSubmitOtp] = useState(false);

    axios.defaults.withCredentials = true;

    const handleInput = (e, index) => {
        if (e.target.value > 0 && index < refs.current.length - 1) {
            refs.current[index + 1].focus();
        }
    }

    const keyDown = (e, index) => {
        if (e.key === "Backspace" && e.target.value === '' && index > 0) {
            refs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArary = paste.split('');

        pasteArary.forEach((el, index) => {
            if (refs.current[index]) {
                refs.current[index].value = el;
            }
        });
    }

    const sendOTP = async(e) => {
        try {
            e.preventDefault();
            const {data} = await axios.post(backend + "/api/auth/resetOTP", {email});

            if (data.success) {
                toast.success(data.message);
                setEmailSent(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const submitOTP = async(e) => {
        const otpArray = refs.current.map(e => e.value);
        const otpCode = otpArray.join('');
        setOtp(otpCode);
        setSubmitOtp(true);
    }

    const reset = async(e) => {
        try {
            e.preventDefault();

            const {data} = await axios.post(backend + "/api/auth/resetPassword", {email, otp, newPassword: password});

            if (data.success) {
                toast.success(data.message);
                nav("/login");
            } else {
                toast.error(data.message);
                setEmailSent(false);
                setSubmitOtp(false);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="bg-slate-800 flex flex-col items-center justify-center min-h-screen px-0 md:px-6">
            <FaHome onClick={() => nav("/")} className="absolute left-5 h-7 text-violet-500 hover:text-violet-600 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />

            {!emailSent &&
                <form onSubmit={sendOTP} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm px-4 mx-2 text-indigo-300">
                    <h1 className="text-2xl text-white font-semibold text-center mb-2">Reset Password</h1>
                    <p className="text-slate-400 mb-4">Enter your account's email address</p>

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-full bg-slate-700">
                        <IoMdMail />
                        <input type="email" id="email" className="bg-transparent outline-none" placeholder="Email" 
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className="flex items-center justify-center">
                        <button className="bg-violet-500 hover:bg-violet-600 text-white rounded-full py-2 px-4">Submit</button>
                    </div>
                </form>}
            
            {!submitOtp && emailSent &&
                <form onSubmit={submitOTP} className="bg-slate-900 p-10 rounded-lg shadow-lg w-full md:w-96 text-indigo-300">
                    <h1 className="text-2xl text-white font-semibold text-center mb-2">Enter Reset Password OTP</h1>

                    <div className="flex justify-between mt-4 mb-6" onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index) => (
                            <input type="text" maxLength="1" key={index} 
                                className="w-10 h-14 bg-slate-700 text-center text-white text-xl rounded-md" ref={e => refs.current[index] = e}
                                    onInput={e => handleInput(e, index)} onKeyDown={e => keyDown(e, index)} />
                        ))}
                    </div>

                    <div className="flex items-center justify-center">
                        <button className="bg-violet-500 hover:bg-violet-600 text-white rounded-full py-2 px-4">Submit</button>
                    </div>
                </form>}
            
            {submitOtp && emailSent &&
                <form onSubmit={reset} className="bg-slate-900 p-8 rounded-lg shadow-lg w-full md:w-96 text-indigo-300">
                    <h1 className="text-2xl text-white font-semibold text-center mb-2">New Password</h1>
                    
                    <div className="mb-4 flex items-center gap-3 w-full px-6 py-2 rounded-full bg-slate-700">
                        <FaLock />
                        <input type="password" id="password" className="bg-transparent outline-none" placeholder="Password"
                            value={password} onChange={e => setPassword(e.target.value)} required />
                        <FaEye onClick={() => handleType("password")} className="hover:text-gray-300 cursor-pointer"/>
                    </div>

                    <div className="flex items-center justify-center">
                        <button className="bg-violet-500 hover:bg-violet-600 text-white rounded-full py-2 px-4">Reset</button>
                    </div>
                </form>}     
        </div>
    )
}

export default ResetPassword