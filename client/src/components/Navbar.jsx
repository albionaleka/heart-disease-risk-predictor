import { useNavigate } from "react-router-dom";
import reactLogo from "../assets/react.svg";
import { AppContext } from "../context/AppContext";
import { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
    const nav = useNavigate();
    const { userData, backend, setIsLoggedin, setUserData, refreshUserData } = useContext(AppContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
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
        <div className="w-full fixed top-0 left-0 z-50 h-20 flex justify-between items-center px-4 sm:px-10 md:px-24 shadow-lg"
            style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)', color: 'var(--app-text)' }}
        >
            <div className="flex items-center gap-4 h-full">
                <img src={reactLogo} alt="Logo" className="cursor-pointer h-[36px]" onClick={() => nav("/")} />
                {userData && (
                    <nav className="hidden md:flex gap-4 items-center ml-8">
                        <button 
                            onClick={() => nav("/")} 
                            className="text-sm hover:text-blue-400 transition-colors font-semibold"
                            style={{ color: 'var(--app-text)' }}
                        >Home</button>
                        <button onClick={() => nav("/dashboard")} className="text-sm hover:text-blue-400 transition-colors font-semibold" style={{ color: 'var(--app-text)' }}>Dashboard</button>
                        <button onClick={() => nav("/patients")} className="text-sm hover:text-blue-400 transition-colors font-semibold" style={{ color: 'var(--app-text)' }}>Patients</button>
                    </nav>
                )}
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle color mode"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="rounded-lg border text-xl h-10 w-10 flex items-center justify-center hover:brightness-110 transition-colors focus:outline-none"
                style={{
                  marginRight: userData ? '8px' : 0,
                  background: 'var(--card-bg)',
                  color: theme === 'dark' ? '#8bb7fa' : '#fac107',
                  borderColor: 'var(--border-color)'
                }}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
              { userData ? (
                <div className="relative" ref={dropdownRef} >
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-10 h-10 flex items-center justify-center border rounded-full p-2 hover:brightness-110 transition-colors font-bold text-lg"
                        style={{ background: 'var(--card-bg)', color: 'var(--app-text)', borderColor: 'var(--border-color)' }}
                    >
                        {userData.name[0].toUpperCase()}
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg z-50 border"
                          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                        >
                            <div className="p-3 border-b" style={{borderColor: 'var(--border-color)'}}>
                                <p className="text-sm font-medium" style={{color:'var(--app-text)'}}>{userData.name}</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{userData.email}</p>
                            </div>
                            <div className="py-1">
                                {userData && !userData.verified && 
                                    <button 
                                        onClick={() => {
                                            sendVerifyOTP();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:brightness-110 transition-colors"
                                        style={{color:'var(--app-text)'}}
                                    >Verify Account</button>
                                }
                                <button 
                                    onClick={() => {
                                        logout();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 hover:dark:bg-red-900 transition-colors"
                                    style={{color:'#ef4444'}}
                                >Logout</button>
                            </div>
                        </div>
                    )}
                </div>
              ) : (
                <button 
                    onClick={() => nav("/login")} 
                    className="rounded-lg px-6 py-2 font-semibold text-sm hover:brightness-110 transition-colors"
                    style={{background:'var(--accent)', color:'#fff'}}>
                    Login
                </button>
              )}
            </div>
        </div>
    )
}

export default Navbar;