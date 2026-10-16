// Client-side sorting for the Explore page. Mirrors server/sorting.js so both give the same order.
export const SORT_OPTIONS = [
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'title_desc', label: 'Title (Z–A)' },
  { value: 'author', label: 'Author (A–Z)' },
  { value: 'rating', label: 'Top rated' },
  { value: 'reviews', label: 'Most reviewed' },
];

export const DEFAULT_SORT = 'title';

export const isValidSort = (value) => SORT_OPTIONS.some((o) => o.value === value);

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const byText = (a, b) => collator.compare(a ?? '', b ?? '');
const count = (b) => Number(b.review_count) || 0;
const rating = (b) => (count(b) > 0 ? Number(b.avg_rating) || 0 : -1); // unreviewed books sort last

const COMPARATORS = {
  title: (a, b) => byText(a.title, b.title),
  title_desc: (a, b) => byText(b.title, a.title),
  author: (a, b) => byText(a.author, b.author) || byText(a.title, b.title),
  rating: (a, b) => rating(b) - rating(a) || count(b) - count(a) || byText(a.title, b.title),
  reviews: (a, b) => count(b) - count(a) || rating(b) - rating(a) || byText(a.title, b.title),
};

/** Returns a new, sorted array (the input is not modified). Unknown keys fall back to title A–Z. */
export function sortBooks(books, key = DEFAULT_SORT) {
  return [...books].sort(COMPARATORS[key] || COMPARATORS[DEFAULT_SORT]);
}
