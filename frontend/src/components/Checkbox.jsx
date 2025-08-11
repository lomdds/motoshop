import { useState } from 'react';

import '../styles/checkbox.css';

export default function Checkbox({ label, checked = false, onChange, disabled = false }) {
  const [isChecked, setIsChecked] = useState(checked);

    const handleChange = (e) => {
        if (disabled) return;
        const newChecked = e.target.checked;
        setIsChecked(newChecked);
        if (onChange) {
            onChange(newChecked);
        }
    };

    const statusClass = disabled ? 'disabled' : 'enabled';

    return (
        <label className={`checkbox-container ${statusClass}`}>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                disabled={disabled}
                className={`checkbox-input ${statusClass}`}
            />
            <span className={`checkbox-label ${statusClass}`}>{label}</span>
        </label>
    );
};