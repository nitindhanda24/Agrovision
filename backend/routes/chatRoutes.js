const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { sendMessage, getMessages } = require("../controllers/chatController");

router.post("/", auth, sendMessage);
router.get("/", auth, getMessages);

module.exports = router;
