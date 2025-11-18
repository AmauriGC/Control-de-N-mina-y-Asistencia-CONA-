import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '@/auth/context/AuthContext';

export default function DashboardIndex() {
    const {user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/dashboard/admin', {replace: true});
            } else if (user.role === 'employee') {
                navigate('/dashboard/employee', {replace: true});
            }
        }
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirigiendo...</p>
        </div>
    );
}
