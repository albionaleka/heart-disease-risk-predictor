import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const PublicRoute = ({ children }) => {
    const { isLoggedin, isLoading } = useContext(AppContext);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--app-bg)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: 'var(--accent)'}}></div>
                    <p className="mt-4" style={{ color: 'var(--app-text)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (isLoggedin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;

