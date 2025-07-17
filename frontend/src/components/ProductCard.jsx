import "../styles/productCard.css"

export default function ProductCard({Brand = "Производитель", BikeModel = "Модель мотоцикла", EngineCapacity = "Объём двигателя", Power = "Мощность двигателя", Color = "Цвет", Price = "10"}) {
    return (
        <div className="card">
            <div className="card-title" >
                <span className="title">{Brand} {BikeModel}</span>
            </div>
            <div className="card-properties">
                <p className="property">Производитель: {Brand}</p>
                <p className="property">Модель: {BikeModel}</p>
                <p className="property">Объём дввигателя: {EngineCapacity} Куб.СМ.</p>
                <p className="property">Мощность двигателя: {Power} Л.С.</p>
                <p className="property">Цвет: {Color}</p>
            </div>
            <div className="card-price">
                <p className="price">{Price} ₽</p>
            </div>
        </div>
    );
}