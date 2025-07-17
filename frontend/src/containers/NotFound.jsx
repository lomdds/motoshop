import amogus from "../assets/amogus.gif"

import "../styles/notfound.css"

export default function NotFound() {
    return (
        <main className="not-found">
            <div className="textandspiner">
                <h1>Not Found</h1>
                <img src={amogus} alt="loading progress" />
            </div>
        </main>
    )
}