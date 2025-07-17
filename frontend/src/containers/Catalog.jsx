import Card from "../components/ProductCard"
import AmogusProgress from "../components/AmogusProgress"

import { useCallback, useState, useEffect } from "react"

import "../styles/catalog.css"


export default function Catalog() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    const spinner = isLoading ? <AmogusProgress /> : null

    const getProductsList = useCallback(async () => {
        setIsLoading(true)
        const url = new URL('http://localhost:3002/products')
        const productsData = await fetch(url).then(res => res.json())
        console.log('productsData', productsData)
        setProducts(productsData)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        getProductsList()
    }, [getProductsList])

    const refreshCatalog = useCallback(() => {
        getProductsList()
        console.log('Обновление каталога...')
    }, [getProductsList])
    
    
    return (
        <>
            <div className="catalog">
                {spinner || (<>
                    <div className='catalog'>
                        {products.map(item => <Card key={item.id} {...item} refreshCatalog={refreshCatalog} />)}
                    </div>
                </>)}
            </div>
        </>
    );
}