import { useNavigate } from "react-router-dom";
import reactLogo from "../assets/react.svg";
import { AppContext } from "../context/AppContext";
import { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { FaSun, FaMoon, FaBell } from "react-icons/fa";

const Navbar = () => {
    const nav = useNavigate();
    const { userData, backend, setIsLoggedin, setUserData, refreshUserData } = useContext(AppContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userData) return;
            try {
                const res = await fetch(`${backend}/api/patient/notifications`);
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.notifications || []);
                    setNotificationCount(data.count || 0);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

        const handleCheckupCompleted = () => {
            fetchNotifications();
        };
        window.addEventListener('checkupCompleted', handleCheckupCompleted);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('checkupCompleted', handleCheckupCompleted);
        };
    }, [userData, backend]);

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
                        <button onClick={() => nav("/")} className="text-sm hover:text-blue-400 transition-colors font-semibold" style={{ color: 'var(--app-text)' }}>Dashboard</button>
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
                {theme === 'dark' ? <FaMoon /> : <FaSun />}
              </button>
              { userData && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="rounded-lg border h-10 w-10 flex items-center justify-center hover:brightness-110 transition-colors focus:outline-none relative"
                    style={{
                      background: 'var(--card-bg)',
                      color: 'var(--app-text)',
                      borderColor: 'var(--border-color)'
                    }}
                    title="Appointment Notifications"
                  >
                    <FaBell />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" style={{ fontSize: '10px' }}>
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 border max-h-96 overflow-y-auto"
                      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                    >
                      <div className="p-3 border-b sticky top-0" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--app-text)' }}>Appointment Notifications</h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{notificationCount} {notificationCount === 1 ? 'patient' : 'patients'} need attention</p>
                      </div>
                      <div className="py-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            No upcoming appointments
                          </div>
                        ) : (
                          notifications.map((notif, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                nav(`/patient/${notif.patientId}`);
                                setIsNotificationsOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:brightness-110 transition-colors border-b"
                              style={{ 
                                borderColor: 'var(--border-color)',
                                background: notif.isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{notif.patientName}</p>
                                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{notif.patientEmail}</p>
                                  <p className="text-xs mt-1" style={{ 
                                    color: notif.isOverdue ? '#ef4444' : '#f59e0b',
                                    fontWeight: '500'
                                  }}>
                                    {notif.isOverdue 
                                      ? `⚠️ Overdue by ${Math.abs(notif.daysUntil)} day${Math.abs(notif.daysUntil) !== 1 ? 's' : ''}`
                                      : `📅 Appointment in ${notif.daysUntil} day${notif.daysUntil !== 1 ? 's' : ''}`
                                    }
                                  </p>
                                </div>
                                <div className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                                  {new Date(notif.nextAppointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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