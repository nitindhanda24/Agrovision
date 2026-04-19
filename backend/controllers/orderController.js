const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const { productId, farmerId, deliveryMandi } = req.body;

    if (!req.user || req.user.role !== "trader") {
      return res.status(403).json({ message: "Only traders can create order requests" });
    }

    if (!productId || !farmerId) {
      return res.status(400).json({ message: "Product, farmer and trader are required" });
    }

    const product = await Product.findById(productId).select("farmerId");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const normalizedFarmerId = String(farmerId);
    if (String(product.farmerId) !== normalizedFarmerId) {
      return res.status(400).json({ message: "Farmer does not match selected product" });
    }

    const order = await Order.create({
      productId,
      traderId: req.user.id,
      farmerId: normalizedFarmerId,
      deliveryMandi
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    if (!req.user || !["farmer", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only farmers and admins can update orders" });
    }

    const statusMap = {
      approved: "accepted",
      rejected: "declined"
    };
    const normalizedStatus = statusMap[req.body.status] || req.body.status;

    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    if (req.user.role === "farmer" && String(existing.farmerId) !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to update this order" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status: normalizedStatus }, { new: true, runValidators: true });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, q } = req.query;
    const filters = {};
    if (status && status !== "all") filters.status = status;

    if (req.user.role === "farmer") filters.farmerId = req.user.id;
    if (req.user.role === "trader") filters.traderId = req.user.id;

    const orders = await Order.find()
      .find(filters)
      .populate("productId", "name price quantity mandi")
      .populate("farmerId", "name email")
      .populate("traderId", "name email")
      .sort({ createdAt: -1 });

    const filtered = q
      ? orders.filter((order) => order.productId?.name?.toLowerCase().includes(String(q).toLowerCase()))
      : orders;

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
