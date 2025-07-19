import { useCallback, useState } from "react"
import { useAuth } from "../helpers/AuthContext"
import Button from "./Button"
import DeleteModal from "./DeleteModal"
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
            refreshCatalog();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setOpenDeleteModal(false);
        }
    }, [id, refreshCatalog]);
    
    return (
        <>
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
                    <p className="property">Объём двигателя: {EngineCapacity} Куб.СМ.</p>
                    <p className="property">Мощность двигателя: {Power} Л.С.</p>
                    <p className="property">Цвет: {Color}</p>
                </div>
                <div className="buttonsandprice">
                    {isAuth && (
                        <div className="buttons">
                            <Button type="delete" onClick={() => setOpenDeleteModal(true)}>x</Button>
                        </div>
                    )}
                    <div className="card-price">
                        <p className="price">{Price} ₽</p>
                    </div>
                </div>
            </div>
        </>
    )
}