import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '../components/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { useState, useEffect } from 'react';

import '../styles/editmodal.css';

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

export default function EditModal({ open, onClose, cardData, onEdit }) {
    const [Brand, setBrand] = useState('')
    const [BikeModel, setBikeModel] = useState('')
    const [EngineCapacity, setEngineCapacity] = useState('')
    const [Power, setPower] = useState('')
    const [Color, setColor] = useState('')
    const [Price, setPrice] = useState('')


    useEffect(() => {
        if (cardData) {
            setBrand(cardData.Brand)
            setBikeModel(cardData.BikeModel);
            setEngineCapacity(cardData.EngineCapacity);
            setPower(cardData.Power);
            setColor(cardData.Color);
            setPrice(cardData.Price);
        }
    }, [cardData]);

    const handleEdit = () => {
        const editedData = {
            Brand: Brand,
            BikeModel: BikeModel,
            EngineCapacity: Number(EngineCapacity),
            Power: Number(Power),
            Color: Color,
            Price: Number(Price)
        };

        onEdit(editedData);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Редактировать карточку
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
                        <Button type='submit' onClick={handleEdit}>
                            Изменить
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
}