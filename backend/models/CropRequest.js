const mongoose = require("mongoose");

const cropRequestSchema = new mongoose.Schema({
  cropName: { type: String, required: true, trim: true },
  cropType: { type: String, default: "grains", trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  note: { type: String, default: "", trim: true },
  imageUrl: { type: String, default: "" },
  traderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  deliveryMandi: { type: String, default: "", trim: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  respondedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("CropRequest", cropRequestSchema);
