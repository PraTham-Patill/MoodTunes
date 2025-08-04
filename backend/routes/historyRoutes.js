const express = require('express');
const { addHistory, getHistory, clearHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addHistory);         // Add history
router.get('/', protect, getHistory);          // Get history
router.delete('/', protect, clearHistory);     // Clear history

module.exports = router;
