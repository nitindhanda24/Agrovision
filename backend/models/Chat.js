const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: String, default: "all" },
  message: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
