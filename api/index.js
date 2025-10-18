const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const bookRoutes = require('../routes/books');
const userRoutes = require('../routes/users');
const borrowRoutes = require('../routes/borrow');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrow', borrowRoutes);


app.get('/', (req, res) => {
  res.json({
    message: 'Library Management API is running! 🚀',
    endpoints: {
      books: {
        'GET /api/books': 'Get all books',
        'GET /api/books/:id': 'Get specific book details',
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id/history': 'Get user borrowing history',
      },
      borrow: {
        'GET /api/borrow/history': 'Get all borrowing history'
      }
    },
    test_endpoints: [
      `${req.protocol}://${req.get('host')}/api/books`,
      `${req.protocol}://${req.get('host')}/api/users`,
      `${req.protocol}://${req.get('host')}/api/books/1`
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requested_url: req.originalUrl,
    available_routes: [
      'GET /',
      'GET /health',
      'GET /api/books',
      'GET /api/books/:id',
      'GET /api/users',
      'GET /api/users/:id/history',
      'GET /api/borrow/history'
    ]
  });
});

module.exports = app;