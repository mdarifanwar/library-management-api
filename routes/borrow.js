const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// FIXED: Correct paths for Vercel
const historyFilePath = path.join(process.cwd(), 'data', 'borrowingHistory.json');

const readHistoryData = async () => {
  try {
    const data = await fs.readFile(historyFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading history data:', error);
    return [];
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

module.exports = router;