import Accordion from './Accordion';
import Checkbox from './Checkbox';

import '../styles/catalogFilters.css';

export default function CatalogFilter({ title, type, options, inputs }) {
  return (
    <Accordion title={title}>
      <div className="filter-content">
        {type === 'checkbox' && options.map((option, index) => (
          <Checkbox
            key={index}
            label={option.label}
            checked={option.checked}
            onChange={() => option.onChange(!option.checked)}
          />
        ))}
        {type === 'input' && inputs && (
          <div className="filter-inputs">
            {inputs.map((input, index) => (
              <input
                key={index}
                placeholder={input.placeholder}
                value={input.value}
                onChange={input.onChange}
                className="filter-input"
              />
            ))}
          </div>
        )}
      </div>
    </Accordion>
  );
}