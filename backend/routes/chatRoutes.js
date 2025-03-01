const express = require('express');
const Chat = require('../models/chatModel');
const router = express.Router();

// Fetch messages between two users
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { senderId: req.params.senderId, receiverId: req.params.receiverId },
        { senderId: req.params.receiverId, receiverId: req.params.senderId },
      ],
    }).sort({ createdAt: 1 }); // Sort by timestamp
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
});

module.exports = router;