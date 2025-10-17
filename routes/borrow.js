    const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const booksFilePath = path.join(__dirname, '../data/books.json');
const usersFilePath = path.join(__dirname, '../data/users.json');
const historyFilePath = path.join(__dirname, '../data/borrowingHistory.json');

// Helper functions
const readBooksData = async () => {
  try {
    const data = await fs.readFile(booksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books data:', error);
    return [];
  }
};

const readUsersData = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users data:', error);
    return [];
  }
};

const readHistoryData = async () => {
  try {
    const data = await fs.readFile(historyFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading history data:', error);
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

const writeHistoryData = async (history) => {
  try {
    await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing history data:', error);
    return false;
  }
};

// GET /api/borrow/history - Get all borrowing history
router.get('/history', async (req, res) => {
  try {
    const history = await readHistoryData();
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowing history',
      error: error.message
    });
  }
});

// POST /api/borrow/borrow - Borrow a book
router.post('/borrow', async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Book ID are required'
      });
    }

    const books = await readBooksData();
    const users = await readUsersData();
    const history = await readHistoryData();

    const user = users.find(u => u.id === parseInt(userId));
    const book = books.find(b => b.id === parseInt(bookId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.active) {
      return res.status(400).json({
        success: false,
        message: 'User account is not active'
      });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!book.available) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }

    // Update book availability
    book.available = false;
    const bookSuccess = await writeBooksData(books);

    // Create borrowing record
    const borrowDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    const newRecord = {
      id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
      userId: parseInt(userId),
      bookId: parseInt(bookId),
      borrowDate: borrowDate,
      returnDate: null,
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'borrowed'
    };

    history.push(newRecord);
    const historySuccess = await writeHistoryData(history);

    if (bookSuccess && historySuccess) {
      res.json({
        success: true,
        message: 'Book borrowed successfully',
        data: {
          record: newRecord,
          book: book,
          user: user
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error processing borrow request'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error borrowing book',
      error: error.message
    });
  }
});

// POST /api/borrow/return - Return a book
router.post('/return', async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Book ID are required'
      });
    }

    const books = await readBooksData();
    const history = await readHistoryData();

    const book = books.find(b => b.id === parseInt(bookId));
    const borrowRecord = history.find(record => 
      record.userId === parseInt(userId) && 
      record.bookId === parseInt(bookId) && 
      record.status === 'borrowed'
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'No active borrowing record found for this book and user'
      });
    }

    // Update book availability
    book.available = true;
    const bookSuccess = await writeBooksData(books);

    // Update borrowing record
    borrowRecord.returnDate = new Date().toISOString().split('T')[0];
    borrowRecord.status = 'returned';
    const historySuccess = await writeHistoryData(history);

    if (bookSuccess && historySuccess) {
      res.json({
        success: true,
        message: 'Book returned successfully',
        data: {
          record: borrowRecord,
          book: book
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error processing return request'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
});

module.exports = router;