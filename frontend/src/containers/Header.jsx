import { useState, useEffect } from 'react';
import Button from "../components/Button";
import Search from "../components/Search";
import AuthModal from "../components/AuthModal";
import '../styles/header.css';

export default function Header() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' или 'register'
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        
        if (token && username) {
            setUserData({ username });
        }
    }, []);

    const handleLogin = (username) => {
        setUserData({ username });
        setIsAuthModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUserData(null);
    };

    const openLoginModal = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openRegisterModal = () => {
        setAuthMode('register');
        setIsAuthModalOpen(true);
    };

    return (
        <header>
            <div className="namelogo-bar">
                <h2 className="name">Motocycles</h2>
            </div>
            <div className="search-bar">
                <Search />
            </div>
            <div className="user-bar">
                {userData ? (
                    <>
                        <span className="username">Hello, {userData.username}</span>
                        <Button type='logout' onClick={handleLogout}>Выйти</Button>
                    </>
                ) : (
                    <>
                        <Button type="authorization" onClick={openLoginModal}>
                            Войти
                        </Button>
                        <Button type="authorization" onClick={openRegisterModal}>
                            Зарегистрироваться
                        </Button>
                    </>
                )}
            </div>
            
            {isAuthModalOpen && (
                <AuthModal 
                    isLogin={authMode === 'login'}
                    onClose={() => setIsAuthModalOpen(false)}
                    onLogin={handleLogin}
                />
            )}
        </header>
    );
}