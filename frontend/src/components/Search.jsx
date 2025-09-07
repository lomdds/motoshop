import { useCallback } from 'react';
import Button from './Button';
import searchlogo from '../assets/search.svg';
import '../styles/search.css';

let timeoutID = undefined;

export default function Search({ value = '', onSearch, width = '400px', height = '26px' }) {
    const handleInputChange = useCallback((e) => {
        const searchString = e.target.value;
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => onSearch(searchString), 300);
    }, [onSearch]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            onSearch(e.target.value);
        }
    }, [onSearch]);

    return (
        <div id='search'>
            <input
                id='searchInput'
                placeholder='поиск'
                type='text'
                defaultValue={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
            {/* <Button type='search' onClick={() => onSearch(document.getElementById('searchInput').value)}>
                <img className='searchlogo' src={searchlogo} alt='searchlogo' width='20px' />
            </Button> */}
        </div>
    );
}