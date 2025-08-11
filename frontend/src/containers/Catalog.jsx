import Card from "../components/ProductCard"
import AmogusProgress from "../components/AmogusProgress"
import CreateModal from "../components/CreateModal"
import Button from "../components/Button"
import Accordion from "../components/Accordion"
import Checkbox from "../components/Checkbox"

import { useCallback, useState, useEffect } from "react"
import { useAuth } from "../hooks/AuthContext"

import "../styles/catalog.css"
import ResponseModal from "../components/ResponseModal"
import CatalogFilter from "../components/CatalogFilter"
import { IoHandLeft } from "react-icons/io5"


export default function Catalog() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [message, setMessage] = useState("Тестовое сообщение модального окна")
    const [openResponseModal, setOpenResponseModal] = useState(false)

    const { isAuth } = useAuth()

    const [openCreateModal, setOpenCreateModal] = useState(false)

    const [selectedBrands, setSelectedBrands] = useState([]);

    const [engineCapacityRange, setEngineCapacityRange] = useState({
        min: '',
        max: ''
    });

    const [enginePowerRange, setEnginePowerRange] = useState({
        min: '',
        max: ''
    });

    const [priceRange, setPriceRange] = useState({
        min: '',
        max: ''
    });

    const handleEngineCapacityChange = useCallback((field, value) => {
        setEngineCapacityRange(prev => ({
            ...prev,
            [field]: value === '' ? '' : Number(value)
        }));
        }, []);

    const handleEnginePowerChange = useCallback((field, value) => {
        setEnginePowerRange(prev => ({
            ...prev,
            [field]: value === '' ? '' : Number(value)
        }));
        }, []);

    const handlePriceChange = useCallback((field, value) => {
        setPriceRange(prev => ({
            ...prev,
            [field]: value === '' ? '' : Number(value)
        }));
        }, []);

    const spinner = isLoading ? <AmogusProgress /> : null

    const filteredProducts = products.filter(product => {
        // Фильтр по брендам
        const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.Brand);
        
        // Фильтр по объёму двигателя
        const engineCapacity = Number(product.EngineCapacity);
        const minEngine = engineCapacityRange.min === '' ? -Infinity : engineCapacityRange.min;
        const maxEngine = engineCapacityRange.max === '' ? Infinity : engineCapacityRange.max;
        const engineMatch = engineCapacity >= minEngine && engineCapacity <= maxEngine;
        
        // Фильтр по мощности
        const enginePower = Number(product.Power);
        const minPower = enginePowerRange.min === '' ? -Infinity : enginePowerRange.min;
        const maxPower = enginePowerRange.max === '' ? Infinity : enginePowerRange.max;
        const powerMatch = enginePower >= minPower && enginePower <= maxPower;

        // Фильтр по цене
        const price = Number(product.Price);
        const minPrice = priceRange.min === '' ? -Infinity : priceRange.min;
        const maxPrice = priceRange.max === '' ? Infinity : priceRange.max;
        const priceMatch = price >= minPrice && price <= maxPrice;

        return brandMatch && engineMatch && powerMatch && priceMatch;
    });

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
    
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    const uniqueBrands = [...new Set(products.map(item => item.Brand))];

    const handleBrandChange = (brand, isChecked) => {
        setSelectedBrands(prev => 
            isChecked 
            ? [...prev, brand] 
            : prev.filter(b => b !== brand)
        );
    };

    return (
        <>
        <ResponseModal open={openResponseModal} message={message} onClose={handleCloseResponseModal} />
        <CreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onCreate={handleCreate} />
            <div className="catalog">
                {spinner || (<>
                    <div className="catalog-content">
                        <div className="catalog-filters">
                            <CatalogFilter 
                                title="Производитель" 
                                type="checkbox" 
                                options={uniqueBrands.map(brand => ({
                                    label: brand,
                                    value: brand,
                                    onChange: (isChecked) => handleBrandChange(brand, isChecked)
                                }))}
                            />
                            <CatalogFilter
                                title="Объём двигателя"
                                type="input"
                                inputs={[
                                    {
                                        placeholder: 'От',
                                        value: engineCapacityRange.min,
                                        onChange: (e) => handleEngineCapacityChange('min', e.target.value)
                                    },
                                    {
                                        placeholder: 'До',
                                        value: engineCapacityRange.max,
                                        onChange: (e) => handleEngineCapacityChange('max', e.target.value)
                                    }
                                ]}
                            />
                            <CatalogFilter
                                title="Мощность двигателя"
                                type="input"
                                inputs={[
                                    {
                                        placeholder: 'От',
                                        value: enginePowerRange.min,
                                        onChange: (e) => handleEnginePowerChange('min', e.target.value)
                                    },
                                    {
                                        placeholder: 'До',
                                        value: enginePowerRange.max,
                                        onChange: (e) => handleEnginePowerChange('max', e.target.value)
                                    }
                                ]}
                            />
                            <CatalogFilter
                                title="Цена"
                                type="input"
                                inputs={[
                                    {
                                        placeholder: 'От',
                                        value: priceRange.min,
                                        onChange: (e) => handlePriceChange('min', e.target.value)
                                    },
                                    {
                                        placeholder: 'До',
                                        value: priceRange.max,
                                        onChange: (e) => handlePriceChange('max', e.target.value)
                                    }
                                ]}
                            />
                        </div>
                        <div className='catalog-buttons-and-cards'>
                            <div className="catalog-buttons">
                                { isAuth && (
                                    <Button type="addcard" onClick={() => setOpenCreateModal(true)}>+</Button>
                                )}
                            </div>
                            <div className="catalog-cards">
                                {filteredProducts.map(item => {
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
                        </div>
                    </div>
                </>)}
            </div>
        </>
    );
    
}