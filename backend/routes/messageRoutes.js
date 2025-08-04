const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRoomMessages,
  createMessage
} = require('../controllers/messageController');

// Message routes
router.get('/:roomId', protect, getRoomMessages);
router.post('/:roomId', protect, createMessage);

module.exports = router;