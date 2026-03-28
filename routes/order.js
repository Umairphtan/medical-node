const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controler/order");

const auth = require("../middleware/auth");

// USER
router.post("/", auth, createOrder);
router.get("/my", auth, getMyOrders);

// ADMIN
router.get("/", auth, getAllOrders);
router.put("/:id", auth, updateOrderStatus);
router.delete("/:id", auth, deleteOrder);

module.exports = router;