const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { receiver, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Sender and message are required" });
    }

    const msg = await Chat.create({ sender: req.user.id, receiver, message });
    res.status(201).json(msg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chats = await Chat.find()
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
