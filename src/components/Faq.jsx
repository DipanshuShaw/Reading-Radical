import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

// Accessible accordion using native <details>.
const Faq = ({ items, title = 'Frequently asked questions' }) => (
  <section className="max-w-3xl mx-auto px-6 py-14">
    <h2 className="font-display text-3xl md:text-4xl text-center mb-8">{title}</h2>
    <div className="space-y-3">
      {items.map((it) => (
        <details key={it.q} className="group bg-white rounded-2xl shadow-sm open:shadow-md transition p-5 text-left">
          <summary className="flex items-center justify-between gap-4 font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span>{it.q}</span>
            <ChevronDown size={20} className="shrink-0 text-brand transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-gray-600 leading-relaxed">{it.a}</p>
        </details>
      ))}
    </div>
  </section>
);

Faq.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ q: PropTypes.string, a: PropTypes.string })).isRequired,
  title: PropTypes.string,
};

export default Faq;
