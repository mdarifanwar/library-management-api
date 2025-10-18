const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const borrowRoutes = require('./routes/borrow');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrow', borrowRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Library Management API',
    endpoints: {
      books: {
        'GET /api/books': 'Get all books',
        'GET /api/books/:id': 'Get specific book details',
        'POST /api/books': 'Add new book',
        'PUT /api/books/:id': 'Update book',
        'DELETE /api/books/:id': 'Delete book'
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get specific user details',
        'GET /api/users/:id/history': 'Get user borrowing history',
        'POST /api/users': 'Add new user',
        'PUT /api/users/:id': 'Update user subscription'
      },
      borrow: {
        'POST /api/borrow/borrow': 'Borrow a book',
        'POST /api/borrow/return': 'Return a book',
        'GET /api/borrow/history': 'Get all borrowing history'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Library API server running on http://localhost:${PORT}`);
});

module.exports = app;