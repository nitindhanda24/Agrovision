const path = require("path");
const CropRequest = require("../models/CropRequest");

exports.uploadRequestImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please upload an image" });
  const imageUrl = `/uploads/${path.basename(req.file.path)}`;
  res.status(201).json({ imageUrl });
};

exports.createRequest = async (req, res) => {
  try {
    const { cropName, cropType, price, quantity, note, imageUrl } = req.body;
    if (req.user.role !== "trader") {
      return res.status(403).json({ message: "Only traders can send crop purchase requests" });
    }

    if (!cropName || !price || !quantity) {
      return res.status(400).json({ message: "Crop name, price and quantity are required" });
    }

    const created = await CropRequest.create({
      cropName,
      cropType: cropType || "grains",
      price: Number(price),
      quantity: Number(quantity),
      note: note || "",
      imageUrl: imageUrl || "",
      deliveryMandi: req.body.deliveryMandi || "",
      traderId: req.user.id
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = {};
    const statusMap = { approved: "accepted", declined: "rejected" };
    const normalizedStatus = statusMap[status] || status;
    if (normalizedStatus && normalizedStatus !== "all") filters.status = normalizedStatus;

    if (req.user.role === "trader") filters.traderId = req.user.id;
    if (req.user.role === "farmer") {
      filters.$or = [{ farmerId: req.user.id }, { farmerId: null }];
    }

    const rows = await CropRequest.find(filters)
      .populate("traderId", "name email")
      .populate("farmerId", "name email")
      .sort({ createdAt: -1 });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const existing = await CropRequest.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Request not found" });

    const isTraderOwner = req.user.role === "trader" && String(existing.traderId) === req.user.id;
    const isFarmerOwner = req.user.role === "farmer" && (!existing.farmerId || String(existing.farmerId) === req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isTraderOwner && !isFarmerOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const next = {};
    if (isTraderOwner && existing.status === "pending") {
      const { cropName, cropType, price, quantity, note, imageUrl, deliveryMandi } = req.body;
      if (cropName !== undefined) next.cropName = cropName;
      if (cropType !== undefined) next.cropType = cropType;
      if (price !== undefined) next.price = Number(price);
      if (quantity !== undefined) next.quantity = Number(quantity);
      if (note !== undefined) next.note = note;
      if (imageUrl !== undefined) next.imageUrl = imageUrl;
      if (deliveryMandi !== undefined) next.deliveryMandi = deliveryMandi;
    }

    if ((isFarmerOwner || isAdmin) && req.body.status) {
      const statusMap = {
        approved: "accepted",
        declined: "rejected"
      };
      const normalizedStatus = statusMap[req.body.status] || req.body.status;
      if (!["accepted", "rejected"].includes(normalizedStatus)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (existing.status !== "pending") {
        return res.status(400).json({ message: "Only pending requests can be reviewed" });
      }
      next.status = normalizedStatus;
      next.respondedAt = new Date();
      if (!existing.farmerId && req.user.role === "farmer") {
        next.farmerId = req.user.id;
      }
    }

    const updated = await CropRequest.findByIdAndUpdate(req.params.id, next, { new: true })
      .populate("traderId", "name email")
      .populate("farmerId", "name email");
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
