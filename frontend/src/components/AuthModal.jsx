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
            const url = isLogin ? 'http://localhost:3002/get-token' : 'http://localhost:3002/register';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isLogin ? { username, password } : { username, email, password }),
            });

            const responseText = await response.text();
            
            if (!responseText.trim()) {
                throw new Error('Empty response from server');
            }

            const data = JSON.parse(responseText);
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            onLogin(data.username);
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred during registration');
            console.error('Registration error:', err);
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
                    <div className="form-group-button">
                        <Button type="submit">
                            {isLogin ? 'Войти' : 'Зарегистрироваться'}
                        </Button>
                    </div>
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