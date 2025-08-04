const mongoose = require('mongoose');

const roomSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    mood: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    isPrivate: { type: Boolean, default: false },
    code: { type: String, required: true, unique: true },
    maxUsers: { type: Number, default: 10 },
    currentSong: {
      id: { type: String, default: null },
      title: { type: String, default: null },
      artist: { type: String, default: null },
      thumbnailUrl: { type: String, default: null },
      timestamp: { type: Number, default: 0 }
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);