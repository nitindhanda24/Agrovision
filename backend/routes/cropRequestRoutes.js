const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  uploadRequestImage,
  createRequest,
  getRequests,
  updateRequest
} = require("../controllers/cropRequestController");

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
    return res.status(403).json({ message: "Only traders can upload request images" });
  }
  next();
};

router.post("/upload-image", auth, requireTrader, upload.single("image"), uploadRequestImage);
router.post("/", auth, createRequest);
router.get("/", auth, getRequests);
router.put("/:id", auth, updateRequest);

module.exports = router;
