const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRoom,
  getPublicRooms,
  getRoomByCode,
  getRoomById, // Add this
  joinRoom,
  leaveRoom,
  updateCurrentSong
} = require('../controllers/roomController');

// Room routes
router.post('/', protect, createRoom);
router.get('/', protect, getPublicRooms);
router.get('/code/:code', protect, getRoomByCode);
router.get('/:roomId', protect, getRoomById); // Add this route
router.post('/join', protect, joinRoom);
router.delete('/:roomId/leave', protect, leaveRoom);
router.put('/:roomId/song', protect, updateCurrentSong);

module.exports = router;