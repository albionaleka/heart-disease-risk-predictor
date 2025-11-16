import { createContext, useEffect, useState } from "react"
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const backend = import.meta.env.VITE_BACKEND;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = backend;

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                setIsLoggedin(false);
                setUserData(null);
            }
            return Promise.reject(error);
        }
    );

    const getData = async () => {
        try {
            const { data } = await axios.get("/api/user/data");
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedin(true);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.message);
            }
        }
    }

    const getAuth = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.post("/api/auth/authenticated");
            if (data.success) {
                setUserData(data.userData || data.user);
                setIsLoggedin(true);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Auth check failed:", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const refreshUserData = async () => {
        await getData();
    }

    const value = {
        backend,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getData, getAuth, refreshUserData,
        isLoading
    }

    useEffect(() => {
        getAuth();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                getAuth();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;