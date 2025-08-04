const mongoose = require('mongoose');

const historySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user
      ref: 'Test', // Refers to the 'Test' model (user schema)
      required: true,
    },
    mood: { type: String, required: true },
    date: { type: String, required: true },  // Store date in 'YYYY-MM-DD' format
    time: { type: String, required: true },  // Store time in 'HH:mm:ss' format
    songTitle: { type: String, required: true },
    artist: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
