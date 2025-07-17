import Catalog from "./Catalog"
import NotFound from './NotFound';

import { Routes, Route, useNavigate } from 'react-router-dom'

import amogus from "../assets/amogus.gif"

import "../styles/content.css"

export default function Header() {
    const navigation = useNavigate();
    const spinner = (navigation.state == 'loading') ? <img src={amogus} alt="loading-progress" /> : null

    return(
        <>
            {spinner}
            <main className="content">
                <Routes>
                    <Route path="products" element={<Catalog />} />
                    <Route path="notfound" element={<NotFound />} />
                </Routes>
            </main>
        </>
    )
}