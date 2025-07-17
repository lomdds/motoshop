import amogus from "../assets/amogus.gif"
import "../styles/amogusProgress.css"

export default function AmogusProgress() {
    return (
        <div className="amogus-container">
            <img src={amogus} alt="loading progress" className="amogus-spinner" />
        </div>
    )
}