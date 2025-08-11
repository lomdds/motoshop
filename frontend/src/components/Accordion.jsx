import { useState } from 'react';

import { FiChevronDown } from 'react-icons/fi';

import '../styles/accordion.css';

export default function Accordion({ title, children, isOpen: propsIsOpen, onToggle }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = propsIsOpen !== undefined;
  const isOpen = isControlled ? propsIsOpen : internalIsOpen;

  const toggleAccordion = () => {
    if (isControlled) {
      onToggle(!isOpen);
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={toggleAccordion}>
        <h3 className="accordion-title">{title}</h3>
        <FiChevronDown className={`accordion-icon ${isOpen ? 'open' : ''}`} />
      </div>
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};