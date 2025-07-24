import Button from './Button';

import { useState, useEffect } from 'react';
import { formatNumber } from "../hooks/formatNumber"

import '../styles/cart.css';

export default function Cart() {
    const [cart, setCart] = useState({
        items: [],
        total: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3002/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке корзины');
            }

            const data = await response.json();
            setCart({
                items: data.items || [],
                total: data.total || 0
            });
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3002/cart/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении количества');
            }

            setCart(prev => {
                const updatedItems = prev.items.map(item => 
                    item.id === itemId 
                        ? { 
                            ...item, 
                            quantity: newQuantity,
                            subtotal: item.product.Price * newQuantity
                        } 
                        : item
                );
                
                const newTotal = updatedItems.reduce(
                    (sum, item) => sum + item.subtotal,
                    0
                );
                
                return {
                    items: updatedItems,
                    total: newTotal
                };
            });

        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3002/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении товара');
            }

            setCart(prev => {
                const updatedItems = prev.items.filter(item => item.id !== itemId);
                const newTotal = updatedItems.reduce(
                    (sum, item) => sum + (item.product.Price * item.quantity),
                    0
                );
                
                return {
                    items: updatedItems,
                    total: newTotal
                };
            });

        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const handleClearCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3002/cart/clear', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при очистке корзины');
            }

            setCart({
                items: [],
                total: 0
            });

        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    if (isLoading) {
        return <div className="cart-loading">Загрузка корзины...</div>;
    }

    if (!localStorage.getItem('token')) {
        return <div className="cart-empty">Войдите, чтобы просмотреть корзину</div>;
    }

    if (cart.items.length === 0) {
        return <div className="cart-empty">Ваша корзина пуста</div>;
    }

    return (
        <div className="cart-container">
            <h2>Ваша корзина</h2>
            
            <div className="cart-items">
                {cart.items.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-info">
                            <h3>{item.product.Brand} {item.product.BikeModel}</h3>
                            <p>Цена: {formatNumber(item.product.Price, "₽")}</p>
                        </div>
                        
                        <div className="item-controls">
                            <div className="quantity-control">
                                <Button 
                                    type="quantity" 
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>
                                <span>{item.quantity}</span>
                                <Button 
                                    type="quantity" 
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                >
                                    +
                                </Button>
                            </div>
                            
                            <Button 
                                type="remove" 
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                Удалить
                            </Button>
                        </div>
                        
                        <div className="item-subtotal">
                            <p>Итого: {formatNumber(item.subtotal, "₽")}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="cart-summary">
                <h3>Общая сумма: {formatNumber(cart.total, "₽")}</h3>
                
                <div className="cart-actions">
                    <Button type="clear" onClick={handleClearCart}>
                        Очистить корзину
                    </Button>
                    <Button type="checkout">
                        Оформить заказ
                    </Button>
                </div>
            </div>
        </div>
    );
}