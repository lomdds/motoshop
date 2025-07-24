import Button from "../components/Button";
import Search from "../components/Search";
import AuthModal from "../components/AuthModal";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

import carticon from "../assets/cart.svg" 

import '../styles/header.css';

export default function Header() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [userData, setUserData] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        
        if (token && username) {
            setUserData({ username });
        }
    }, []);

    const handleSoftReload = () => {
        navigate(0);
    };

    const handleLogin = (username, user_id) => {
        localStorage.setItem("username", username);
        localStorage.setItem("user_id", user_id);
        setUserData({ username });
        setIsAuthModalOpen(false);
        handleSoftReload();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        setUserData(null);
        handleSoftReload();
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
                <Link className="link-name" to="/products">
                    <h2 className="name">Motocycles</h2>
                </Link>
            </div>
            <div className="search-bar">
                <Search />
            </div>
            <div className="user-bar">
                {userData ? (
                    <>
                        <Button type="user-control-button" >
                            <Link to="/cart">
                                <img src={carticon} alt='корзина' />
                            </Link>
                        </Button>
                        <span className="username">{userData.username}</span>
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