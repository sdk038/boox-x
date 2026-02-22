import React, {useState} from 'react';
import {HomeAlt1, Dashboard, Gear, Folder, SignOut, Pin, Person} from 'akar-icons';
import {useAuth} from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import '../pages/Sidebar.css';
import presentationLogo from '../icons/business-presentation.png';
import aiLogo from '../icons/illustrator.png';

const SidebarAuthPanel = ({onClose}) => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({name: '', email: '', password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {login, register} = useAuth();
    const { t, language } = useLanguage();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (mode === 'login') {
            if (!formData.email || !formData.password) {
                setError(t('sidebar.fillAllFields'));
                setLoading(false);
                return;
            }
            const result = await login(formData.email, formData.password);
            if (result?.success) {
                onClose();
            } else {
                setError(result?.message || t('sidebar.loginError'));
            }
        } else {
            if (!formData.name || !formData.email || !formData.password) {
                setError(t('sidebar.fillAllFields'));
                setLoading(false);
                return;
            }
            if (formData.password.length < 6) {
                setError(t('sidebar.minPassword'));
                setLoading(false);
                return;
            }
            const result = await register(formData);
            if (result?.success) {
                onClose();
            } else {
                setError(result?.message || t('sidebar.registerError'));
            }
        }
        setLoading(false);
    };

    return (
        <div className="sidebar-auth-overlay" onClick={onClose}>
            <div className="sidebar-auth-panel" onClick={(e) => e.stopPropagation()}>
                <button className="sidebar-auth-close" onClick={onClose}>&times;</button>

                <div className="sidebar-auth-header">
                    <Logo size={36}/>
                    <h2>{mode === 'login' ? t('sidebar.authTitleLogin') : t('sidebar.authTitleRegister')}</h2>
                </div>

                <div className="sidebar-auth-tabs">
                    <button
                        className={mode === 'login' ? 'active' : ''}
                        onClick={() => {
                            setMode('login');
                            setError('');
                        }}
                    >
                        {t('sidebar.login')}
                    </button>
                    <button
                        className={mode === 'register' ? 'active' : ''}
                        onClick={() => {
                            setMode('register');
                            setError('');
                        }}
                    >
                        {t('sidebar.createAccount')}
                    </button>
                </div>

                {error && <div className="sidebar-auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="sidebar-auth-form">
                    {mode === 'register' && (
                        <input
                            type="text"
                            name="name"
                            placeholder={t('settings.name')}
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={language === 'en' ? 'Password' : 'Пароль'}
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button type="submit" className="sidebar-auth-submit" disabled={loading}>
                        {loading ? t('common.loading') : mode === 'login' ? t('sidebar.login') : t('sidebar.register')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Sidebar = ({activeTab, setActiveTab, onExpandChange, isPinned, onPinToggle}) => {
    const {user, logout} = useAuth();
    const { t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authPanelOpen, setAuthPanelOpen] = useState(false);

    const isGuest = !user?.email;

    const handleLogout = () => {
        if (window.confirm(t('sidebar.confirmLogout'))) {
            logout();
        }
    };

    const handleMouseEnter = () => {
        if (!isPinned && onExpandChange) {
            onExpandChange(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned && onExpandChange) {
            onExpandChange(false);
        }
    };

    const handleMobileTabChange = (tab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    };

    return (
        <>
            <aside
                className={`sidebar ${isPinned ? 'pinned' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="left">
                    <div className="avatar" title={user?.name || 'Пользователь'}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="avatar-img"/>
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>

                    <button
                        className={activeTab === 'home' ? 'active' : ''}
                        onClick={() => setActiveTab('home')}
                        title="Home"
                    >
                        <HomeAlt1 size={20}/>
                    </button>

                    <button
                        className={activeTab === 'ai' ? 'active' : ''}
                        onClick={() => setActiveTab('ai')}
                        title="AI"
                    >
                        <img src={aiLogo} alt="AI" className="sidebar-ai-icon" />
                    </button>

                    <button
                        className={activeTab === 'presentations' ? 'active' : ''}
                        onClick={() => setActiveTab('presentations')}
                        title="Презентации"
                    >
                        <img src={presentationLogo} alt="Презентации" className="sidebar-presentation-icon" />
                    </button>

                    <button
                        className={`bottom-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                        title="Settings"
                    >
                        <Gear size={20}/>
                    </button>

                    {isGuest ? (
                        <button
                            className="bottom-btn login-btn"
                            onClick={() => setAuthPanelOpen(true)}
                            title={t('sidebar.login')}
                        >
                            <Person size={20}/>
                        </button>
                    ) : (
                        <button
                            className="bottom-btn logout-btn"
                            onClick={handleLogout}
                            title={t('sidebar.logout')}
                        >
                            <SignOut size={20}/>
                        </button>
                    )}
                </div>

                <div className="right">
                    <div className="right-header">
                        <div className="header-text">
                            <div className="sidebar-brand">
                                <Logo size={32}/>
                                <h1>Daler AI</h1>
                            </div>
                            <p className="user-name">{t('sidebar.hello')}, {user?.name}!</p>
                        </div>
                        <button
                            className={`pin-button ${isPinned ? 'active' : ''}`}
                            onClick={onPinToggle}
                            title={isPinned ? t('sidebar.unpin') : t('sidebar.pin')}
                        >
                            <Pin size={18}/>
                        </button>
                    </div>

                    <nav className="buttons">
                        <button
                            className={activeTab === 'ai' ? 'active' : ''}
                            onClick={() => setActiveTab('ai')}
                        >
                            <i><img src={aiLogo} alt="AI" className="sidebar-ai-icon-large" /></i>
                            <span>AI</span>
                        </button>

                        <button
                            className={activeTab === 'boards' ? 'active' : ''}
                            onClick={() => setActiveTab('boards')}
                        >
                            <i><Dashboard size={24}/></i>
                            <span>Boards</span>
                        </button>

                        <button
                            className={activeTab === 'presentations' ? 'active' : ''}
                            onClick={() => setActiveTab('presentations')}
                        >
                            <i><img src={presentationLogo} alt="Презентации" className="sidebar-presentation-icon-large" /></i>
                            <span>{t('sidebar.presentations')}</span>
                        </button>

                        <button
                            className={activeTab === 'files' ? 'active' : ''}
                            onClick={() => setActiveTab('files')}
                        >
                            <i><Folder size={24}/></i>
                            <span>Files</span>
                        </button>

                        {user?.role === 'admin' && (
                            <button
                                className={activeTab === 'admin' ? 'active' : ''}
                                onClick={() => setActiveTab('admin')}
                            >
                                <i><span style={{fontSize: '24px'}}>🛡️</span></i>
                            <span>{t('sidebar.admin')}</span>
                            </button>
                        )}
                    </nav>

                    {isGuest && (
                        <div className="sidebar-guest-cta">
                            <p>{t('sidebar.saveProjectsPrompt')}</p>
                            <button onClick={() => setAuthPanelOpen(true)}>
                                {t('sidebar.loginRegister')}
                            </button>
                        </div>
                    )}
                </div>
            </aside>


            <nav className="mobile-nav">
                <button
                    className={`mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => handleMobileTabChange('home')}
                >
                    <HomeAlt1 size={22}/>
                    <span>{t('sidebar.home')}</span>
                </button>
                <button
                    className={`mobile-nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
                    onClick={() => handleMobileTabChange('ai')}
                >
                    <img src={aiLogo} alt="AI" className="mobile-ai-icon" />
                    <span>AI</span>
                </button>
                <button
                    className={`mobile-nav-btn ${activeTab === 'boards' ? 'active' : ''}`}
                    onClick={() => handleMobileTabChange('boards')}
                >
                    <Dashboard size={22}/>
                    <span>{t('sidebar.boards')}</span>
                </button>
                <button
                    className={`mobile-nav-btn mobile-more-btn ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span className="mobile-nav-icon">☰</span>
                    <span>{t('sidebar.more')}</span>
                </button>
            </nav>

            {/* Mobile "More" Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <div className="mobile-menu-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="mobile-avatar-img"/>
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <div>
                                <h3>{user?.name}</h3>
                                <p>{isGuest ? t('sidebar.guestMode') : user?.email}</p>
                            </div>
                        </div>
                        <div className="mobile-menu-items">
                            <button onClick={() => handleMobileTabChange('presentations')}>
                                <span>📊</span> {t('sidebar.presentations')}
                            </button>
                            <button onClick={() => handleMobileTabChange('files')}>
                                <span>📁</span> {t('sidebar.files')}
                            </button>
                            <button onClick={() => handleMobileTabChange('settings')}>
                                <span>⚙️</span> {t('sidebar.settings')}
                            </button>
                            {user?.role === 'admin' && (
                                <button onClick={() => handleMobileTabChange('admin')}>
                                    <span>🛡️</span> {t('sidebar.admin')}
                                </button>
                            )}
                            {isGuest ? (
                                <button className="mobile-menu-login" onClick={() => {
                                    setMobileMenuOpen(false);
                                    setAuthPanelOpen(true);
                                }}>
                                    <span>🔑</span> {t('sidebar.loginRegister')}
                                </button>
                            ) : (
                                <button className="mobile-menu-logout" onClick={handleLogout}>
                                    <span>🚪</span> {t('sidebar.logout')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {authPanelOpen && <SidebarAuthPanel onClose={() => setAuthPanelOpen(false)}/>}
        </>
    );
};

export default Sidebar;