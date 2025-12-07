import axios from "axios";
import { useContext, useEffect, useRef } from "react";
import { FaHome } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const VerifyAccount = () => {
    const nav = useNavigate();

    const refs = useRef([]);
    const { backend, refreshUserData, userData, isLoggedin, setUserData } = useContext(AppContext);

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

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const otpArray = refs.current.map(e => e.value);
            const otp = otpArray.join('');
            axios.defaults.withCredentials = true;

            const { data } = await axios.post(backend + "/api/auth/verifyEmail", { otp });

            if (data.success) {
                toast.success(data.message);
                setUserData(data.userData);
                await refreshUserData();
                nav("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        isLoggedin && userData && userData.verified && nav("/");
    }, [userData, isLoggedin]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-0 md:px-6 transition-colors duration-300">
            <FaHome onClick={() => nav("/")} className="absolute left-5 h-7 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer transition-colors" style={{ color: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'} />

            <form onSubmit={handleSubmit} className="card p-8 w-96 text-sm px-4 mx-2">
                <h1 className="text-3xl font-semibold text-center mb-6">Verification Code</h1>

                <div className="flex justify-between mt-4 mb-6" onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input type="text" maxLength="1" key={index}
                            className="w-10 h-14 bg-gray-100 dark:bg-slate-700 text-center text-xl rounded-md border border-gray-200 dark:border-gray-600" ref={e => refs.current[index] = e}
                            onInput={e => handleInput(e, index)} onKeyDown={e => keyDown(e, index)} />
                    ))}
                </div>

                <div className="w-full flex items-center justify-center">
                    <button type="submit" className="rounded-lg text-white text-lg px-4 py-2 transition-colors shadow-md hover:shadow-lg" style={{ background: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>Verify</button>
                </div>
            </form>
        </div>
    )
}

export default VerifyAccount