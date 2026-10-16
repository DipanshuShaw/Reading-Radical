// Whitelisted ORDER BY clauses for GET /api/books?sort=...
// Only keys of this object can reach the SQL string, so user input is never concatenated into a query.
// Books with no reviews always sort after rated ones for the rating/reviews sorts.
export const SORTS = {
  title: 'b.title ASC',
  title_desc: 'b.title DESC',
  author: 'b.author ASC, b.title ASC',
  rating: 'avg_rating IS NULL, avg_rating DESC, review_count DESC, b.title ASC',
  reviews: 'review_count DESC, avg_rating DESC, b.title ASC',
};
SORTS.top = SORTS.rating; // legacy alias used by the home page "Top rated" section

export const DEFAULT_SORT = 'title';

export const orderByFor = (sort) => (Object.hasOwn(SORTS, sort) ? SORTS[sort] : SORTS[DEFAULT_SORT]);
