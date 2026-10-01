import { useState } from 'react';
import PropTypes from 'prop-types';

// Accessible clickable star rating input.
const StarPicker = ({ value, onChange, size = 'text-3xl' }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className={`${size} leading-none transition-transform hover:scale-110 ${
            n <= (hover || value) ? 'text-amber-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

StarPicker.propTypes = { value: PropTypes.number.isRequired, onChange: PropTypes.func.isRequired, size: PropTypes.string };

export default StarPicker;
