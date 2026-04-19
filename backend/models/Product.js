const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  cropType: { type: String, default: "grains", trim: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: "kg", trim: true },
  quantity: { type: Number, required: true, min: 0 },
  mandi: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: "approved"
  },
  health: {
    type: String,
    enum: ["healthy", "stable", "monitor"],
    default: "healthy"
  },
  imageUrl: { type: String, default: "" },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", schema);
