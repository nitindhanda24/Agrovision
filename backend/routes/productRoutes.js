const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  addProduct,
  getProducts,
  seedDemoProducts,
  updateProductListing,
  uploadProductImage
} = require("../controllers/productController");

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  }
});

const requireTrader = (req, res, next) => {
  if (req.user.role !== "trader") {
    return res.status(403).json({ message: "Only traders can edit crop listing images" });
  }
  next();
};

const requireListingManager = (req, res, next) => {
  if (!["farmer", "trader"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only farmers and traders can manage crop listings" });
  }
  next();
};

router.post("/", auth, requireListingManager, addProduct);
router.post("/seed-demo", seedDemoProducts);
router.get("/", getProducts);
router.post("/upload-image", auth, requireTrader, upload.single("image"), uploadProductImage);
router.put("/:id/price", auth, requireTrader, updateProductListing);
router.put("/:id/listing", auth, requireTrader, updateProductListing);

module.exports = router;
