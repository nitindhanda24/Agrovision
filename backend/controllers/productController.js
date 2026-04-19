const Product = require("../models/Product");
const User = require("../models/User");
const path = require("path");

exports.uploadProductImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please upload an image" });

  const imageUrl = `/uploads/${path.basename(req.file.path)}`;
  return res.status(201).json({ imageUrl });
};

exports.addProduct = async (req, res) => {
  try {
    const { name, cropType, price, unit, quantity, mandi, status, health, imageUrl } = req.body;

    if (!req.user || !["farmer", "trader"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only farmers and traders can add crop listings" });
    }

    if (!String(name || "").trim() || price === undefined || quantity === undefined || !String(mandi || "").trim()) {
      return res.status(400).json({ message: "All product fields are required" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      cropType: cropType || "grains",
      price: Number(price),
      unit: (unit || "kg").trim(),
      quantity: Number(quantity),
      mandi: String(mandi).trim(),
      status: status || "approved",
      health: health || "healthy",
      imageUrl: imageUrl || "",
      farmerId: req.user.id
    });

    const populated = await product.populate("farmerId", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { q, mandi, cropType, status } = req.query;
    const filters = {};

    if (q) filters.name = { $regex: q, $options: "i" };
    if (mandi && mandi !== "all") filters.mandi = mandi;
    if (cropType && cropType !== "all") filters.cropType = cropType;
    if (status && status !== "all") filters.status = status;

    const data = await Product.find()
      .find(filters)
      .populate("farmerId", "name email")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProductListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, unit, imageUrl } = req.body;

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ message: "Valid crop name is required" });
    }

    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({ message: "Valid price is required" });
    }

    const normalizedUnit = String(unit || "kg").trim();
    if (!normalizedUnit) {
      return res.status(400).json({ message: "Valid unit is required" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        price: Number(price),
        unit: normalizedUnit,
        imageUrl: String(imageUrl || "").trim()
      },
      { new: true, runValidators: true }
    ).populate("farmerId", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.seedDemoProducts = async (req, res) => {
  try {
    let demoFarmer = await User.findOne({ email: "demo.farmer@agrovision.local" });

    if (!demoFarmer) {
      demoFarmer = await User.create({
        name: "Demo Farmer",
        email: "demo.farmer@agrovision.local",
        password: "demo12345",
        role: "farmer"
      });
    }

    const templateProducts = [
      { name: "Sugarcane", cropType: "grains", price: 3200, quantity: 50, mandi: "Hadapsar Mandi", status: "rejected", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=60" },
      { name: "Turmeric", cropType: "spices", price: 8000, quantity: 300, mandi: "Pune APMC", status: "pending", health: "stable", imageUrl: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=1000&q=60" },
      { name: "Soybean", cropType: "oilseeds", price: 5500, quantity: 120, mandi: "Wagholi Mandi", status: "pending", health: "monitor", imageUrl: "https://images.unsplash.com/photo-1591258739298-76388a4178c3?auto=format&fit=crop&w=1000&q=60" },
      { name: "Chickpea", cropType: "pulses", price: 6400, quantity: 180, mandi: "Pune APMC", status: "pending", health: "stable", imageUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=1000&q=60" },
      { name: "Mango", cropType: "fruits", price: 4200, quantity: 200, mandi: "Chinchwad Mandi", status: "approved", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1000&q=60" },
      { name: "Tomato", cropType: "vegetables", price: 2800, quantity: 260, mandi: "Pimpri Mandi", status: "approved", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1000&q=60" },
      { name: "Onion", cropType: "vegetables", price: 2200, quantity: 800, mandi: "Chinchwad Mandi", status: "approved", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=1000&q=60" },
      { name: "Rice", cropType: "grains", price: 2800, quantity: 90, mandi: "Pimpri Mandi", status: "rejected", health: "stable", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=60" },
      { name: "Groundnut", cropType: "oilseeds", price: 5800, quantity: 110, mandi: "Wagholi Mandi", status: "approved", health: "monitor", imageUrl: "https://images.unsplash.com/photo-1560780552-ba546f8d4f26?auto=format&fit=crop&w=1000&q=60" },
      { name: "Wheat", cropType: "grains", price: 2450, quantity: 500, mandi: "Hadapsar Mandi", status: "approved", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1000&q=60" },
      { name: "Maize", cropType: "grains", price: 2300, quantity: 350, mandi: "Pune APMC", status: "pending", health: "stable", imageUrl: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=1000&q=60" },
      { name: "Potato", cropType: "vegetables", price: 1900, quantity: 600, mandi: "Pimpri Mandi", status: "approved", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1000&q=60" },
      { name: "Cotton", cropType: "cash crops", price: 7600, quantity: 85, mandi: "Wagholi Mandi", status: "pending", health: "monitor", imageUrl: "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?auto=format&fit=crop&w=1000&q=60" },
      { name: "Bajra", cropType: "grains", price: 2100, quantity: 270, mandi: "Hadapsar Mandi", status: "approved", health: "stable", imageUrl: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1000&q=60" },
      { name: "Pomegranate", cropType: "fruits", price: 8900, quantity: 140, mandi: "Chinchwad Mandi", status: "approved", health: "healthy", imageUrl: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=1000&q=60" }
    ];

    const existing = await Product.find({
      farmerId: demoFarmer._id,
      name: { $in: templateProducts.map((item) => item.name) }
    }).select("name");

    const existingNames = new Set(existing.map((item) => item.name));
    const toInsert = templateProducts
      .filter((item) => !existingNames.has(item.name))
      .map((item) => ({ ...item, farmerId: demoFarmer._id }));

    if (toInsert.length > 0) {
      await Product.insertMany(toInsert);
    }

    return res.status(201).json({
      message: `${toInsert.length} demo crop(s) added`,
      totalTemplateSize: templateProducts.length
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
