const express = require('express');
const cors = require('cors');
const Book = require("./db/mongoose.js");
const Review = require("./db/review.js");
const bodyParser = require("body-parser");
const User = require  ("./db/user.js");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', async(req, res) => {
  res.send('Hello from Express!');
});

app.post("/login",async(req,res) => {
  const { name } = req.body;
  try{
    const login = new User({ name });
    await login.save()
    res.json(login);
  }catch{
    res.json({ message : "login failed"});
  }
})

// app.get("/books",async(req,res)=>{
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     const skip = (page - 1) * limit;

//     const books = await Book.find().skip(skip).limit(limit);
//     const total = await Book.countDocuments();

//     res.json({
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       books,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch books' });
//   }
// })

app.get('/books', async (req, res) => {
  const page = parseInt(req.query.page) || 1;  // Default to page 1
  const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page

  try {
    const skip = (page - 1) * limit;
    const books = await Book.find().skip(skip).limit(limit);
    const total = await Book.countDocuments();

    // const books = await Book.find().limit(limit);
    res.json({ books });

  }catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
})

app.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews');

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const avgRating = book.ratings.reduce((acc, rating) => acc + rating, 0) / book.ratings.length || 0;

    res.json({ book, avgRating });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid book ID format' });
    }
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

app.get('/reviews', async (req, res) => {
  const { bookId } = req.query;

  if (!bookId) {
    return res.status(400).json({ error: 'Missing bookId in query' });
  }

  try {
    const reviews = await Review.find({ bookId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/addReviews', async (req, res) => {
  try {
    const { bookId, reviewText, rating } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const newReview = new Review({
      reviewText,
      rating,
      book: bookId,
    });

    await newReview.save();

    book.reviews.push(newReview);
    await book.save();

    res.status(201).json({ review: newReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post("/books",async(req,res)=>{
  try {
    const { data } = req.body;
    const saveBook = new Book({
      title: data.title,
      author: data.auther,
      description: data.description,
      ratings: data.rating,
    });
    await saveBook.save();
    res.json({ message : "book saved" , saveBook});
  } catch (error) {
    res.json({ message : "error adding the book"});
  }
})

app.post("/book",async(req,res)=> {
  const { title }= req.body;
  try {
    const regex = new RegExp(title, 'i'); 
    const boooook = await Book.find({ title : regex });
    res.json(boooook);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});