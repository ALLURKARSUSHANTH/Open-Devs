const Chat = require('../models/chatModel');
const User = require('../models/User');

exports.saveMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  try {
    const sender = await User.findById(senderId);
    if (!sender || !sender.connections.includes(receiverId)) {
      return res.status(403).json({ message: 'You are not connected with this user' });
    }

    const chat = new Chat({
      senderId,
      receiverId,
      message
    });
    await chat.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const sender = await User.findById(senderId);
    if (!sender || !sender.connections.includes(receiverId)) {
      return res.status(403).json({ error: "You are not connected with this user" });
    }

    const messages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
