import Button from './Button';

import { useCallback } from 'react';

import searchlogo from '../assets/icons8-поиск-30.svg'
import '../styles/search.css';

let timeoutID = undefined

export default function Search({ value = '', onSearch, width = '400px', height = '26px'}) {
    const handleInputChange = useCallback((e) => {
        onSearch(e.target.value)
        const searchString = e.target.value
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => onSearch(searchString), 300);
    }, []);

    const confirmSearch = useCallback(() => {
        onSearch(value)
    }, [value, onSearch]);

    const handleKeyDown = useCallback((e) => {
        if (e.key == 'enter') {
            confirmSearch()
        }
    }, [confirmSearch])

    return (
        <div id='search'>
            <input
                id='searchInput'
                placeholder='поиск'
                type='text'
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} />
            <Button type='search' onClick={confirmSearch}>
                <img className='searchlogo' src={searchlogo} alt='searchlogo' width='20px' />
            </Button>
        </div>
    );
}