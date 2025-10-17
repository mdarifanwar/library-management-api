const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// FIXED: Correct path for Vercel
const booksFilePath = path.join(process.cwd(), 'data', 'books.json');

// Helper function to read books data
const readBooksData = async () => {
  try {
    const data = await fs.readFile(booksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books data:', error);
    return [];
  }
};

// GET /api/books - Get all books
router.get('/', async (req, res) => {
  try {
    console.log('📚 Fetching all books...');
    const books = await readBooksData();
    
    // Optional query parameters for filtering
    const { search, genre, available } = req.query;
    let filteredBooks = books;

    if (search) {
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (genre) {
      filteredBooks = filteredBooks.filter(book =>
        book.genre.toLowerCase() === genre.toLowerCase()
      );
    }

    if (available !== undefined) {
      filteredBooks = filteredBooks.filter(book =>
        book.available === (available === 'true')
      );
    }

    res.json({
      success: true,
      count: filteredBooks.length,
      data: filteredBooks
    });
  } catch (error) {
    console.error('Error in GET /api/books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

// GET /api/books/:id - Get specific book details
router.get('/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    console.log(`📖 Fetching book with ID: ${bookId}`);
    
    const books = await readBooksData();
    const book = books.find(b => b.id === bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error in GET /api/books/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

module.exports = router;