const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// FIXED: Correct paths for Vercel
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const historyFilePath = path.join(process.cwd(), 'data', 'borrowingHistory.json');

// Helper functions
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

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await readUsersData();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /api/users/:id/history - Get user borrowing history
router.get('/:id/history', async (req, res) => {
  try {
    const users = await readUsersData();
    const history = await readHistoryData();
    const userId = parseInt(req.params.id);
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userHistory = history.filter(record => record.userId === userId);
    
    res.json({
      success: true,
      data: {
        user,
        borrowingHistory: userHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user history',
      error: error.message
    });
  }
});

module.exports = router;