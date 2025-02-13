import { Navigate } from 'react-router-dom';
import { api } from '../utils/api';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    const validateToken = async () => {
        try {
            await api.fetchUserData(); // Verify token is valid
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            return false;
        }
    };

    if (!token || !validateToken()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute; 