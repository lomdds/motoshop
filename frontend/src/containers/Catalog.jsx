import Card from "../components/ProductCard"
import AmogusProgress from "../components/AmogusProgress"
import CreateModal from "../components/CreateModal"
import Button from "../components/Button"

import { useCallback, useState, useEffect } from "react"
import { useAuth } from "../hooks/AuthContext"

import "../styles/catalog.css"
import ResponseModal from "../components/ResponseModal"


export default function Catalog() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [message, setMessage] = useState("Тестовое сообщение модального окна")
    const [openResponseModal, setOpenResponseModal] = useState(false)


    const { isAuth } = useAuth()

    const [openCreateModal, setOpenCreateModal] = useState(false)

    const spinner = isLoading ? <AmogusProgress /> : null

    const getProductsList = useCallback(async () => {
        setIsLoading(true)
        const url = new URL('http://localhost:3002/products')
        const productsData = await fetch(url).then(res => res.json())
        console.log('productsData', productsData)
        setProducts(productsData)
        setIsLoading(false)
    }, [])

    const handleCreate = useCallback(async (productsData) => {
        setOpenCreateModal(false);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3002/products', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Brand: productsData.Brand,
                    BikeModel: productsData.BikeModel,
                    EngineCapacity: Number(productsData.EngineCapacity),
                    Power: Number(productsData.Power),
                    Color: productsData.Color,
                    Price: Number(productsData.Price)
                })
            });

            const responseText = await response.text();
            console.log("Raw response:", responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = responseText ? JSON.parse(responseText) : null;
            console.log("Карточка создана:", data);
            setMessage("Карточка успешно создана.");
            setOpenResponseModal(true);
            refreshCatalog();
        } catch (error) {
            console.error("Ошибка при создании:", error);
            setMessage("Ошибка создания карточки.")
            setOpenResponseModal(true);
        }
    }, [getProductsList]);


    useEffect(() => {
        getProductsList()
    }, [getProductsList])

    const refreshCatalog = useCallback(() => {
        getProductsList()
        console.log('Обновление каталога...')
    }, [getProductsList])
    
    const handleCloseResponseModal = useCallback(() => {
        console.log("Закрытие модалки");
        setOpenResponseModal(false);
    }, [])
    
    return (
        <>
        <ResponseModal open={openResponseModal} message={message} onClose={handleCloseResponseModal} />
        <CreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onCreate={handleCreate} />
            <div className="catalog">
                {spinner || (<>
                    { isAuth && (
                        <div className="catalog-buttons">
                            <Button type="addcard" onClick={() => setOpenCreateModal(true)}>+</Button>
                        </div>
                    )}
                    <div className='catalog-cards'>
                        {products.map(item => {
                            console.log("Product item:", item)
                            return(
                                <Card
                                    key={item.ID || item.id} 
                                    id={item.ID || item.id}
                                    Brand={item.Brand}
                                    BikeModel={item.BikeModel}
                                    EngineCapacity={item.EngineCapacity}
                                    Power={item.Power}
                                    Color={item.Color}
                                    Price={item.Price}
                                    refreshCatalog={refreshCatalog}
                                />
                            )
                        })}
                    </div>
                </>)}
            </div>
        </>
    );
}