const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createOrder, updateOrder, getOrders } = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.put("/:id", auth, updateOrder);
router.get("/", auth, getOrders);

module.exports = router;
