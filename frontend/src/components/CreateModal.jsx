import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '../components/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { useState, useEffect } from 'react';

import '../styles/createmodal.css'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function CreateModal({ open, onClose, onCreate }) {
    const [Brand, setBrand] = useState('')
    const [BikeModel, setBikeModel] = useState('')
    const [EngineCapacity, setEngineCapacity] = useState('')
    const [Power, setPower] = useState('')
    const [Color, setColor] = useState('')
    const [Price, setPrice] = useState('')
    const isFormValid = Brand.trim() !== '' && BikeModel.trim() !== '' && EngineCapacity.trim() !== '' && Power.trim() !== '' && Color.trim() !== '' && Price.trim() !== '';

    useEffect(() => {
        setBrand('')
        setBikeModel('')
        setEngineCapacity('')
        setColor('')
        setPower('')

        setPrice('')
    }, [open])

    const handleCreate = () => {
        if (isFormValid) {
            onCreate({ Brand: Brand, BikeModel: BikeModel, EngineCapacity : EngineCapacity, Power : Power, Color : Color, Price: Price })
            onClose()
        }
    }

    return (
        <Modal
            className='createmodal'
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography className="modal-modal-title" variant="h6" component="h2">
                    Создать карточку
                </Typography>
                <div className='description'>
                    <p>Производитель</p>
                    <input className='createmodalinput' placeholder='Производитель' value={Brand} onChange={(e) => setBrand(e.target.value)} />
                    <p>Модель мотоцикла</p>
                    <input className='createmodalinput' placeholder='Модель мотоцикла' value={BikeModel} onChange={(e) => setBikeModel(e.target.value)} />
                    <p>Объём двигателя (Куб.СМ)</p>
                    <input className='createmodalinput' type='number' placeholder='Объём двигателя' value={EngineCapacity} onChange={(e) => setEngineCapacity(e.target.value)} />
                    <p>Мощность двигателя (Л.С.)</p>
                    <input className='createmodalinput' type='number' placeholder='Мощность двигателя' value={Power} onChange={(e) => setPower(e.target.value)} />
                    <p>Цвет</p>
                    <input className='createmodalinput' placeholder='Цвет' value={Color} onChange={(e) => setColor(e.target.value)} />
                    <p>Цена</p>
                    <input className='createmodalinput' type='number' placeholder='Цена' value={Price} onChange={(e) => setPrice(e.target.value)} />
                    <div className='createbutton'>
                        <Button type='cancel' onClick={onClose} >
                            Отмена
                        </Button>
                        <Button type='submit' onClick={handleCreate} disabled={!isFormValid}>
                            Создать
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
}