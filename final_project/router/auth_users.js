const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":'admin',"password":'admin'}]

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}


regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Error logging in" });
    }
  
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,
        username,
      };
  
      return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  });


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "Invalid request. ISBN and review are required." });
    }
  
    const filteredReviews = books[isbn].reviews.filter((r) => {
      return r.username === username;
    });
  
    if (filteredReviews.length > 0) {
      const existingReview = filteredReviews[0];
      existingReview.review = review;
      return res.status(200).json({ message: "Review modified successfully." });
    } else {
      // Add a new review
      const newReview = {
        username: username,
        review: review
      };
      books[isbn].reviews.push(newReview);
      return res.status(200).json({ message: "Review added successfully." });
    }
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (!isbn) {
      return res.status(400).json({ message: "Invalid request. ISBN is required." });
    }
  
    const filteredReviews = books[isbn].reviews.filter((r) => {
      return r.username === username;
    });
  
    if (filteredReviews.length > 0) {
      // Remove the review
      const reviewIndex = books[isbn].reviews.findIndex((r) => r.username === username);
      books[isbn].reviews.splice(reviewIndex, 1);
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      return res.status(404).json({ message: "Review not found." });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
