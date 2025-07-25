import Button from "./Button"

import { useState } from "react"

import "../styles/responsemodal.css"

export default function ResponseModal({ message = 'модалка', onClose, open }) {
    
    return (
        <>
            { open && (
                <div className="modal-overlay" onClick={onClose} >
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <p className="modal-content-message">{message}</p>
                        <div className="modal-content-button">
                            <Button type="submit" onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}>
                                Ок
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}