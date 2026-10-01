import PropTypes from 'prop-types';

// Read-only star display (supports half values via rounding to nearest whole star).
const Stars = ({ value = 0, size = 'text-lg' }) => (
  <span className={`${size} text-amber-400 tracking-tight`} aria-label={`${value} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (i < Math.round(value) ? '★' : '☆'))}
  </span>
);

Stars.propTypes = { value: PropTypes.number, size: PropTypes.string };

export default Stars;
