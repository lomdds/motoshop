import { useState } from 'react';
import Button from "./Button";
import '../styles/authModal.css';

export default function AuthModal({ isLogin: initialIsLogin, onClose, onLogin }) {
    const [isLogin, setIsLogin] = useState(initialIsLogin);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const response = await fetch(
                    `http://localhost:3002/get-token?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                );
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Ошибка авторизации');
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                onLogin(data.username);
            } else {
                const response = await fetch('http://localhost:3002/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Ошибка регистрации');
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                onLogin(data.username);
            }
        } catch (err) {
            setError(err.message || 'Произошла ошибка');
            console.error('Auth error:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2 className='modal-content-procedure'>{isLogin ? 'Вход' : 'Регистрация'}</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Имя пользователя</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Пароль</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <Button type="submit">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </Button>
                </form>
                
                <div className="switch-mode">
                    {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                    <button 
                        className="link-button" 
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
}