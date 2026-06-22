import React, { useState, useRef, useEffect } from 'react';
import './ComboBox.css';

export default function ComboBox({
  options = [],
  selectedValues = [],
  onAdd,
  onRemove,
  placeholder = 'Buscar o escribir...',
  getOptionValue = (opt) => opt._id || opt,
  getOptionLabel = (opt) => opt.business_name || opt.name || opt,
  allowCustomValues = false,
  emptyMessage = 'No hay opciones disponibles'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filtrar opciones
  const filteredOptions = options.filter(opt => {
    const value = getOptionValue(opt);
    // No mostrar los ya seleccionados
    if (selectedValues.includes(value)) return false;
    // Filtrar por texto de búsqueda
    if (!searchText.trim()) return true;
    const label = getOptionLabel(opt).toString().toLowerCase();
    return label.includes(searchText.toLowerCase());
  });

  // Mostrar sugerencia de valor personalizado si está habilitado
  const showCustomSuggestion = allowCustomValues && 
    searchText.trim() && 
    !options.some(opt => getOptionLabel(opt).toString().toLowerCase() === searchText.toLowerCase()) &&
    !selectedValues.includes(searchText.trim());

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resetear highlighted cuando cambia la lista
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions.length, searchText]);

  const handleSelect = (value) => {
    onAdd(value);
    setSearchText('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const totalItems = filteredOptions.length + (showCustomSuggestion ? 1 : 0);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(getOptionValue(filteredOptions[highlightedIndex]));
        } else if (showCustomSuggestion && (highlightedIndex === filteredOptions.length || highlightedIndex === -1)) {
          handleSelect(searchText.trim());
        } else if (searchText.trim() && allowCustomValues) {
          handleSelect(searchText.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchText('');
        setHighlightedIndex(-1);
        break;
      case 'Backspace':
        if (!searchText && selectedValues.length > 0) {
          onRemove(selectedValues[selectedValues.length - 1]);
        }
        break;
      default:
        break;
    }
  };

  const getLabelForValue = (value) => {
    const opt = options.find(o => getOptionValue(o) === value);
    return opt ? getOptionLabel(opt) : value;
  };

  return (
    <div className="combo-box" ref={containerRef}>
      <div className={`combo-box-control ${isOpen ? 'open' : ''}`}>
        <div className="combo-box-tags">
          {selectedValues.map(value => (
            <span key={value} className="combo-box-tag">
              <span className="combo-box-tag-text">{getLabelForValue(value)}</span>
              <button
                type="button"
                className="combo-box-tag-remove"
                onClick={() => onRemove(value)}
                tabIndex={-1}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="combo-box-input"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedValues.length === 0 ? placeholder : ''}
          />
        </div>
        <span className="combo-box-arrow">▾</span>
      </div>

      {isOpen && (
        <div className="combo-box-dropdown">
          {filteredOptions.length === 0 && !showCustomSuggestion ? (
            <div className="combo-box-empty">{emptyMessage}</div>
          ) : (
            <>
              {filteredOptions.map((opt, index) => {
                const value = getOptionValue(opt);
                const label = getOptionLabel(opt);
                return (
                  <div
                    key={value}
                    className={`combo-box-option ${highlightedIndex === index ? 'highlighted' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(value);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {label}
                  </div>
                );
              })}
              {showCustomSuggestion && (
                <div
                  className={`combo-box-option combo-box-option-custom ${highlightedIndex === filteredOptions.length ? 'highlighted' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(searchText.trim());
                  }}
                  onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                >
                  <span className="combo-box-custom-icon">+</span>
                  Agregar "<strong>{searchText.trim()}</strong>"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
