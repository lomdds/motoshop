import Button from "./Button"
import EditModal from "./EditModal"
import DeleteModal from "./DeleteModal"
import ResponseModal from "./ResponseModal"

import { useCallback, useState } from "react"
import { useAuth } from "../hooks/AuthContext"
import { formatNumber } from "../hooks/formatNumber"

import trash from "../assets/trash.svg"
import edit from "../assets/edit.svg"

import "../styles/productCard.css"

export default function ProductCard({ 
    id: propId, 
    Brand = "Производитель", 
    BikeModel = "Модель мотоцикла", 
    EngineCapacity = "Объём двигателя", 
    Power = "Мощность двигателя", 
    Color = "Цвет", 
    Price = "10",
    refreshCatalog 
}) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)

    const [message, setMessage] = useState("Тестовое сообщение модального окна")
    const [openResponseModal, setOpenResponseModal] = useState(false)

    const { isAuth } = useAuth()
    
    const id = propId !== undefined ? propId : null;
    
    console.log("ProductCard props:", { 
        id: propId, 
        type: typeof propId,
        resolvedId: id
    });

    const handleDelete = useCallback(async () => {
        if (id == null) {
            console.error('ID is null or undefined');
            setOpenDeleteModal(false);
            return;
        }

        console.log('Deleting card with ID:', id, 'Type:', typeof id);
        
        try {
            const url = `http://localhost:3002/products/${id}`;
            console.log('Request URL:', url);
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete error:', errorText);
                throw new Error(errorText || 'Delete failed');
            }

            console.log('Successfully deleted');
            successDeleteResponse();
        } catch (error) {
            console.error('Delete error:', error);
            failDeleteResponse();
        } finally {
            setOpenDeleteModal(false);
        }
    }, [id, refreshCatalog]);

    const successDeleteResponse = useCallback(() => {
        console.log("Вызов successDeleteResponse");
        setMessage("Карточка успешно удалена.");
        setOpenResponseModal(true);
    }, [])

    const failDeleteResponse = useCallback(() => {
        setMessage("Ошибка удаления карточки.");
        setOpenResponseModal(true);
    }, [])
    
    const handleEdit = useCallback(async (updatedData) => {
        if (id == null) {
            console.error('ID is null or undefined');
            setOpenEditModal(false);
            return;
        }

        console.log('Editing card with ID:', id, 'Type:', typeof id, 'Data:', updatedData);
        
        try {
            const url = `http://localhost:3002/products/${id}`;
            console.log('Request URL:', url);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Edit error:', errorText);
                throw new Error(errorText || 'Edit failed');
            }

            console.log('Successfully edited');
            successEditResponse();
        } catch (error) {
            console.error('Edit error:', error);
            failEditResponse();
        } finally {
            setOpenEditModal(false);
        }
    }, [id, refreshCatalog]);

    const successEditResponse = useCallback(() => {
        console.log("Вызов successEditResponse");
        setMessage("Карточка успешно изменена");
        setOpenResponseModal(true);
    }, [])

    const failEditResponse = useCallback(() => {
        setMessage("Ошибка изменения карточки.")
        setOpenResponseModal(true);
    }, [])

    const handleAddToCart = useCallback(async () => {
        if (!isAuth) {
            setMessage("Войдите в систему, чтобы добавить товар в корзину");
            setOpenResponseModal(true);
            return;
        }

        console.log("Текущий ID товара:", id);

        if (!id) {
            console.error('ID товара не указан');
            setMessage("Ошибка: ID товара не найден");
            setOpenResponseModal(true);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3002/cart/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_card_id: id,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка при добавлении в корзину');
            }

            setMessage("Товар добавлен в корзину");
            setOpenResponseModal(true);
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage(`${error.message}`);
            setOpenResponseModal(true);
        }
    }, [id, isAuth]);

    const handleCloseResponseModal = useCallback(() => {
        console.log("Закрытие модалки");
        setOpenResponseModal(false);
        refreshCatalog();
    }, [])

    return (
        <>
            <ResponseModal open={openResponseModal} message={message} onClose={handleCloseResponseModal} />
            <EditModal 
                open={openEditModal} 
                onClose={() => setOpenEditModal(false)} 
                cardData={{ id, Brand, BikeModel, EngineCapacity, Power, Color, Price }} 
                onEdit={handleEdit} 
            />
            <DeleteModal 
                open={openDeleteModal} 
                onClose={() => setOpenDeleteModal(false)} 
                onDelete={handleDelete} 
            />
            <div className="card">
                <div className="card-title">
                    <span className="title">{Brand} {BikeModel}</span>
                </div>
                <div className="card-properties">
                    <p className="property">Производитель: {Brand}</p>
                    <p className="property">Модель: {BikeModel}</p>
                    <p className="property">Объём двигателя: {formatNumber(EngineCapacity, "Куб.СМ.")}</p>
                    <p className="property">Мощность двигателя: {formatNumber(Power, "Л.С.")}</p>
                    <p className="property">Цвет: {Color}</p>
                </div>
                <div className="card-price">
                    <p className="price">{formatNumber(Price, "₽")}</p>
                </div>
                <div className="control-buttons">
                    {isAuth && (
                        <div className="buttons-for-moder">
                            <Button type="delete" onClick={() => setOpenDeleteModal(true)}><img src={trash} alt="удалить" /></Button>
                            <Button type="edit" onClick={() => setOpenEditModal(true)}><img src={edit} alt="изменить" /></Button>
                        </div>
                    )}
                    <div className="buttons-for-buyer">
                        <Button type="buy" onClick={handleAddToCart}>В корзину</Button>
                    </div>
                </div>
            </div>
        </>
    )
}