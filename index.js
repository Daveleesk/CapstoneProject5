import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import fs from 'fs';

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "capstone5",
  password: "WW1",
  port: 5432,
});

const API_URL = "https://covers.openlibrary.org/b/isbn";
// https://covers.openlibrary.org/b/$key/$value-$size.jpg
// e.g. https://covers.openlibrary.org/b/isbn/9780714847030-M.jpg: The Story of Art
// https://covers.openlibrary.org/b/isbn/0806541229-M.jpg
// const response = await axios.get(`${API_URL}/posts`);

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
db.connect();

let sqlOrder = "id ASC";

async function handleJPG(action, newIsbn, oldIsbn) {
  if (action==="new" || action==="edit") {
    try {
      const getIsbn = newIsbn;
      const apiPath = `${API_URL}/${getIsbn}-M.jpg`;
      // console.log(apiPath);
      const response = await axios.get(apiPath, { responseType: 'arraybuffer' });
      const filename = `./public/image/${getIsbn}-M.jpg`;
      // console.log(filename);
      await fs.writeFile(filename, response.data, (err) => {
        if (err) {console.log(err)} else {
          console.log('Image download successfully!');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  if (action==="edit" || action==="delete") {
    try {
      const getIsbn = oldIsbn;
      const filename = `./public/image/${getIsbn}-M.jpg`;
      // console.log(filename);
      await fs.unlink(filename, (err) => {
        if (err) {console.log(err)} else {
          console.log('Image deletion successfully!');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM book_review ORDER BY ${sqlOrder}`);
    // console.log(response);
    res.render("index.ejs", { posts: result.rows });
  } catch (error) {
    console.log(error);
  }
});
// Route to select sorting order
app.get("/book", async (req, res) => {
  try {
    // console.log(req.query.sort);
    switch (req.query.sort) {
      case "title":
        sqlOrder = "title ASC";
        break;
      case "date":
        sqlOrder = "read_time DESC";
        break;
      case "rating":
        sqlOrder = "rating DESC";
        break;
      default:
        sqlOrder = "id ASC";
        break;
    }
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});
// Route to render the new record page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Review", submit: "Create Review" });
});
// Route to render the update record page
app.get("/edit/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM book_review WHERE id = $1", [req.params.id]);
    res.render("modify.ejs", {
      heading: "Edit Review",
      submit: "Update Review",
      post: result.rows[0],
    });
  } catch (error) {
      console.log(error);
  }
});

// Create a new record
app.post("/new/post", async (req, res) => {
  try {
    const result = await db.query("INSERT INTO book_review (title, isbn, read_time, rating, review) VALUES ($1, $2, $3, $4, $5) RETURNING *", 
      [req.body.title, req.body.isbn, req.body.date, req.body.rating, req.body.review]);
    await handleJPG("new", req.body.isbn.trim(),"");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}); 

//  update a record
app.post("/edit/post/:id", async (req, res) => {

  try {
    const result1 = await db.query("SELECT isbn FROM book_review WHERE id = $1", [req.params.id]);
    const result2 = await db.query("UPDATE book_review SET title = $2, isbn = $3, read_time = $4, rating = $5, review = $6 WHERE id = $1 RETURNING *", [req.params.id, req.body.title, req.body.isbn, req.body.date, req.body.rating, req.body.review]);
    if (req.body.isbn.trim() != result1.rows[0].isbn.trim()) {
      await handleJPG("edit", req.body.isbn.trim(), result1.rows[0].isbn.trim());
    }
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// Delete a record
app.get("/delete/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM book_review WHERE id = $1 RETURNING *", [req.params.id]);
    await handleJPG("delete", "", result.rows[0].isbn.trim());
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }

});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
