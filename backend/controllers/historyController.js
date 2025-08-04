const History = require('../models/history');
const mongoose = require('mongoose');

// Add history entry
const addHistory = async (req, res) => {
    const { mood, date, time, songTitle, artist } = req.body;
    const userId = req.user.id;  // Extract user ID from token

    try {
        // Check if the user already has 15 history entries
        const historyCount = await History.countDocuments({ user: userId });

        // If history length reaches 15, delete the oldest entry
        if (historyCount >= 15) {
            const oldestHistory = await History.findOne({ user: userId })
                .sort({ createdAt: 1 }); // Sort by oldest created date

            if (oldestHistory) {
                await History.findByIdAndDelete(oldestHistory._id);
            }
        }

        // Create a new history entry
        const newHistory = await History.create({
            user: userId,
            mood,
            date,
            time,
            songTitle,
            artist
        });

        res.status(201).json(newHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user history
const getHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const history = await History.find({ user: userId }).sort({ createdAt: -1 }); // Newest first
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear history
const clearHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        await History.deleteMany({ user: userId });
        res.status(200).json({ message: 'History cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addHistory,
    getHistory,
    clearHistory
};
