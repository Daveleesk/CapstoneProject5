# CapstoneProject5 
Objectives
- integrating public APIs into web projects.
- using Express/Node.js for server-side programming.
- demonstrating CRUD data in a PostgreSQL Database to persist data.

Functionalities:
- home page to browse book records. Details including book title, read date, ISBN, review and rating
- fetching book cover in .jpg via Open Library Covers API; showing the book cover when browing
- performing add, edit and delete actions on book records
- performing sort records in order of title, read date and rating
- prompting confirmation alert upon deletion

PostgresSQL:
database: capstone5
Table: book_review
SQL: CREATE TABLE book_review (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  read_time DATE,
  rating INTEGER,
  isbn VARCHAR(20),
  review TEXT
);

Folder Structure:
/
/public
/public/image
/public/style
/view

Installation:
npm install

Server startup:
nodemon index.js

