const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');
const historyFilePath = path.join(__dirname, '../data/borrowingHistory.json');

const readUsersData = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users data:', error);
    return [];
  }
};

const writeUsersData = async (users) => {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users data:', error);
    return false;
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

router.get('/', async (req, res) => {
  try {
    const users = await readUsersData();
    
    const { active, membershipType } = req.query;
    let filteredUsers = users;

    if (active !== undefined) {
      filteredUsers = filteredUsers.filter(user =>
        user.active === (active === 'true')
      );
    }

    if (membershipType) {
      filteredUsers = filteredUsers.filter(user =>
        user.membershipType.toLowerCase() === membershipType.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const users = await readUsersData();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

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

router.post('/', async (req, res) => {
  try {
    const users = await readUsersData();
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...req.body,
      joinDate: new Date().toISOString().split('T')[0],
      active: true
    };

    users.push(newUser);
    const success = await writeUsersData(users);

    if (success) {
      res.status(201).json({
        success: true,
        message: 'User added successfully',
        data: newUser
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving user'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding user',
      error: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const users = await readUsersData();
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex] = { ...users[userIndex], ...req.body };
    const success = await writeUsersData(users);

    if (success) {
      res.json({
        success: true,
        message: 'User updated successfully',
        data: users[userIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating user'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

module.exports = router;