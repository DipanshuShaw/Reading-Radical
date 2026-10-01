// Backend URL. Override with VITE_API_URL in a root .env file (e.g. for production).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// One place for contact details used in the header, footer and contact page.
export const SITE = {
  phone: '+91-88675-97658',
  landline: '033-4855-1578-4468',
  email: 'readingradical@gmail.com',
};

export const GENRES = [
  { slug: 'all', label: 'All', genre: null },
  { slug: 'romantic', label: 'Romantic', genre: 'Romance' },
  { slug: 'action', label: 'Action', genre: 'Action' },
  { slug: 'motivational', label: 'Motivational', genre: 'Motivational' },
  { slug: 'scifi', label: 'Sci-Fi', genre: 'Sci-Fi' },
  { slug: 'comedy', label: 'Comedy', genre: 'Comedy' },
  { slug: 'fantasy', label: 'Fantasy', genre: 'Fantasy' },
  { slug: 'horror', label: 'Horror', genre: 'Horror' },
];
