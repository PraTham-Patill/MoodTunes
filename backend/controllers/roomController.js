const Room = require('../models/Room');
const Message = require('../models/Message');
const generateRoomCode = require('../utils/generateRoomCode');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { title, mood, maxUsers, isPrivate } = req.body;
    const userId = req.user.id;

    // Generate a unique room code
    const code = generateRoomCode();

    const newRoom = await Room.create({
      title,
      mood,
      owner: userId,
      isPrivate: isPrivate || false,
      code,
      maxUsers: maxUsers || 10,
      participants: [userId]
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
};

// Get all public rooms
const getPublicRooms = async (req, res) => {
  try {
    const { mood } = req.query;
    
    let query = { isPrivate: false };
    if (mood) {
      query.mood = mood;
    }
    
    const rooms = await Room.find(query)
      .populate('owner', 'name')
      .populate('participants', 'name')
      .sort({ createdAt: -1 });
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

// Get room by code
const getRoomByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const room = await Room.findOne({ code })
      .populate('owner', 'name')
      .populate('participants', 'name');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

// Join a room
const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    const room = await Room.findOne({ code });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if room is full
    if (room.participants.length >= room.maxUsers) {
      return res.status(400).json({ message: 'Room is full' });
    }
    
    // Check if user is already in the room
    if (!room.participants.includes(userId)) {
      // Add user to participants
      room.participants.push(userId);
      await room.save();
    }
    
    const populatedRoom = await Room.findById(room._id)
      .populate('owner', 'name')
      .populate('participants', 'name');
    
    // Emit participant update event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(room._id.toString()).emit('participant_updated', {
        roomId: room._id.toString(),
        participants: populatedRoom.participants
      });
      
      // Also emit room_updated event for general refresh
      io.to(room._id.toString()).emit('room_updated');
    }
    
    res.json(populatedRoom);
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
};

// Leave a room
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Remove user from participants
    room.participants = room.participants.filter(
      participant => participant.toString() !== userId
    );
    
    // If owner leaves, delete the room
    if (room.owner.toString() === userId) {
      await Room.findByIdAndDelete(roomId);
      await Message.deleteMany({ room: roomId });
      
      // Notify all users in the room that it's been deleted
      const io = req.app.get('io');
      if (io) {
        io.to(roomId).emit('room_deleted');
      }
      
      return res.json({ message: 'Room deleted successfully' });
    }
    
    await room.save();
    
    // Get updated room with populated participants
    const populatedRoom = await Room.findById(roomId)
      .populate('owner', 'name')
      .populate('participants', 'name');
      
    // Emit participant update event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('participant_updated', {
        roomId,
        participants: populatedRoom.participants
      });
      
      // Also emit room_updated event for general refresh
      io.to(roomId).emit('room_updated');
    }
    
    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ message: 'Failed to leave room' });
  }
};

// Update current song
const updateCurrentSong = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { songId, title, artist, thumbnailUrl, timestamp } = req.body;
    const userId = req.user.id;
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Only owner can update the current song
    if (room.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only room owner can update the current song' });
    }
    
    room.currentSong = {
      id: songId,
      title,
      artist,
      thumbnailUrl,
      timestamp
    };
    
    await room.save();
    res.json(room);
  } catch (error) {
    console.error('Error updating current song:', error);
    res.status(500).json({ message: 'Failed to update current song' });
  }
};

// Add this function to your roomController.js

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId)
      .populate('owner', 'name')
      .populate('participants', 'name');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

// Make sure to export the new function
module.exports = {
  createRoom,
  getPublicRooms,
  getRoomByCode,
  getRoomById, // Add this
  joinRoom,
  leaveRoom,
  updateCurrentSong
};