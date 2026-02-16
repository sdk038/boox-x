import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from "./components/Login";
import Dashboard from "./components/Dashboard";
import Logo from "./components/Logo";
import './App.css';


(function initTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
})();

const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-spinner">
            <Logo size={80} />
            <div className="spinner"></div>
            <p>Загрузка...</p>
        </div>
    </div>
);

const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'darkMode') {
                if (e.newValue === 'true') {
                    document.body.classList.add('dark-theme');
                } else {
                    document.body.classList.remove('dark-theme');
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);


    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div>
            {isAuthenticated ? <Dashboard /> : <Login />}
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;