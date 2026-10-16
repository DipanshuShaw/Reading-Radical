import test from 'node:test';
import assert from 'node:assert/strict';
import { sortBooks, isValidSort, SORT_OPTIONS } from './sortBooks.js';

// Alpha: 2 reviews avg 4.0 | Beta: 1 review 5.0 | Gamma: 3 reviews avg 3.0 | Delta: no reviews
const books = [
  { title: 'Beta', author: 'Zed', avg_rating: '5.0', review_count: 1 },
  { title: 'Alpha', author: 'Yan', avg_rating: '4.0', review_count: 2 },
  { title: 'Gamma', author: 'Abe', avg_rating: '3.0', review_count: 3 },
  { title: 'Delta', author: 'Mia', avg_rating: null, review_count: 0 },
];
const titles = (key) => sortBooks(books, key).map((b) => b.title);

test('title A-Z and Z-A', () => {
  assert.deepEqual(titles('title'), ['Alpha', 'Beta', 'Delta', 'Gamma']);
  assert.deepEqual(titles('title_desc'), ['Gamma', 'Delta', 'Beta', 'Alpha']);
});
test('author A-Z', () => assert.deepEqual(titles('author'), ['Gamma', 'Delta', 'Alpha', 'Beta']));
test('top rated puts unreviewed books last', () => assert.deepEqual(titles('rating'), ['Beta', 'Alpha', 'Gamma', 'Delta']));
test('most reviewed', () => assert.deepEqual(titles('reviews'), ['Gamma', 'Alpha', 'Beta', 'Delta']));
test('unknown or missing key falls back to title A-Z', () => {
  assert.deepEqual(titles('bogus'), ['Alpha', 'Beta', 'Delta', 'Gamma']);
  assert.deepEqual(titles(undefined), ['Alpha', 'Beta', 'Delta', 'Gamma']);
});
test('does not mutate its input', () => {
  const before = books.map((b) => b.title);
  sortBooks(books, 'rating');
  assert.deepEqual(books.map((b) => b.title), before);
});
test('ties break by title; case and digits are handled', () => {
  const tied = [
    { title: 'b', author: 'x', avg_rating: '4.0', review_count: 1 },
    { title: 'A', author: 'x', avg_rating: '4.0', review_count: 1 },
    { title: 'Book 10', author: 'x', avg_rating: '4.0', review_count: 1 },
    { title: 'Book 2', author: 'x', avg_rating: '4.0', review_count: 1 },
  ];
  assert.deepEqual(sortBooks(tied, 'rating').map((b) => b.title), ['A', 'b', 'Book 2', 'Book 10']);
});
test('validity helper matches the option list', () => {
  assert.ok(SORT_OPTIONS.every((o) => isValidSort(o.value)));
  assert.equal(isValidSort('nope'), false);
});
