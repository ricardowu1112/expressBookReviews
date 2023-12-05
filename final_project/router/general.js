const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      const message = `User ${username} successfully registered. Now you can login`;
      return res.status(200).json({message});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(books[isbn]);
      } else {
        res.send(`Book with ISBN ${isbn} does not exist.`);
      }
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorToFind = req.params.author;

    const foundBooks = Object.values(books).filter(book => book.author === authorToFind);

    if (foundBooks.length > 0) {
      const bookDetails = foundBooks.map(book => ({ title: book.title, reviews: book.reviews }));
      res.send(JSON.stringify({ author: authorToFind, books: bookDetails },null,4));
    } else {
      res.send({ message: `No books found by ${authorToFind}.` });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleToFind = req.params.title;

    const foundBooks = Object.values(books).filter(book =>
        book.title.toLowerCase().includes(titleToFind.toLowerCase())
    );

    if (foundBooks.length > 0) {
        const bookDetails = foundBooks.map(book => ({ title: book.title, author: book.author }));
        return res.status(200).json({ books: bookDetails });
    } else {
        return res.status(404).json({ message: `No books found with title '${titleToFind}'.` });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(books[isbn].reviews);
      } else {
        res.send(`Book with ISBN ${isbn} does not exist.`);
      }
});

module.exports.general = public_users;
