-- Reading Radical schema. Run once:  mysql -u root -p < server/sql/schema.sql
CREATE DATABASE IF NOT EXISTS readingradical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE readingradical;

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_reviewer   TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  book_id     INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image VARCHAR(1000),
  genre       VARCHAR(50) NOT NULL,
  INDEX idx_books_genre (genre)
);

CREATE TABLE IF NOT EXISTS reviews (
  review_id  INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT NOT NULL,
  user_id    INT NULL,
  reviewer   VARCHAR(100) NOT NULL,
  comment    TEXT NOT NULL,
  rating     TINYINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  INDEX idx_reviews_book (book_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  stars       TINYINT NOT NULL,
  comment     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
