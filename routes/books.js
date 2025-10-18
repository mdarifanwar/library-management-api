const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const booksFilePath = path.join(__dirname, '../data/books.json');

const readBooksData = async () => {
  try {
    const data = await fs.readFile(booksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books data:', error);
    return [];
  }
};

const writeBooksData = async (books) => {
  try {
    await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing books data:', error);
    return false;
  }
};

router.get('/', async (req, res) => {
  try {
    const books = await readBooksData();
    
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
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const books = await readBooksData();
    const bookId = parseInt(req.params.id);
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
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const books = await readBooksData();
    const newBook = {
      id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
      ...req.body,
      available: true
    };

    books.push(newBook);
    const success = await writeBooksData(books);

    if (success) {
      res.status(201).json({
        success: true,
        message: 'Book added successfully',
        data: newBook
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving book'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const books = await readBooksData();
    const bookId = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    books[bookIndex] = { ...books[bookIndex], ...req.body };
    const success = await writeBooksData(books);

    if (success) {
      res.json({
        success: true,
        message: 'Book updated successfully',
        data: books[bookIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating book'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const books = await readBooksData();
    const bookId = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const deletedBook = books.splice(bookIndex, 1);
    const success = await writeBooksData(books);

    if (success) {
      res.json({
        success: true,
        message: 'Book deleted successfully',
        data: deletedBook[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error deleting book'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

module.exports = router;