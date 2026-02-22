import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Dashboard from "./components/Dashboard";
import './App.css';


(function initTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
})();

(function initLanguage() {
    const lang = localStorage.getItem('language') || 'ru';
    document.documentElement.lang = lang;
})();

const AppContent = () => {
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
            <Dashboard />
        </div>
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </LanguageProvider>
    );
};

export default App;