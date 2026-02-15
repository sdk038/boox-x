import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from "./components/Login";
import Dashboard from "./components/Dashboard";

// Мгновенно применяем тему из localStorage до рендера
(function initTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
})();

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    // Также следим за изменениями в localStorage (на случай нескольких вкладок)
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