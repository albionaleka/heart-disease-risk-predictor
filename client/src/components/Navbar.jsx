import { useNavigate } from "react-router-dom";
import reactLogo from "../assets/react.svg";
import { AppContext } from "../context/AppContext";
import { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
    const nav = useNavigate();
    const { userData, backend, setIsLoggedin, setUserData, refreshUserData } = useContext(AppContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isDropdownOpen) {
            refreshUserData();
        }
    }, [isDropdownOpen]);

    const sendVerifyOTP = async () => {
        try {
            if (userData.verified) {
                toast.info("Account is already verified");
                return;
            }

            axios.defaults.withCredentials = true;
            const {data} = await axios.post(backend + "/api/auth/verify");

            if (data.success) {
                nav("/verify");
                toast.info(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.post(backend + "/api/auth/logout", { email: userData.email });

            if (data.success) {
                setIsLoggedin(false);
                setUserData(false);
                nav("/login");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="w-full flex justify-between p-4 items-center absolute top-0 sm:p-6 sm:px-24">
            <img src={reactLogo} alt="Logo" />

            { userData ? (
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-10 h-10 flex items-center justify-center border border-gray-500 rounded-full p-2 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        {userData.name[0].toUpperCase()}
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-gray-700">
                                <p className="text-white text-sm font-medium">{userData.name}</p>
                                <p className="text-gray-400 text-xs">{userData.email}</p>
                            </div>
                            <div className="py-1">
                                {userData && !userData.verified && 
                                    <button 
                                        onClick={() => {
                                            sendVerifyOTP();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                                    >
                                        Verify Account
                                    </button>
                                }
                                <button 
                                    onClick={() => {
                                        logout();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    onClick={() => nav("/login")} 
                    className="bg-violet-500 rounded-full px-4 text-white py-1 hover:bg-violet-400 transition-colors"
                >
                    Login
                </button>
            )}
        </div> 
    )
}

export default Navbar;