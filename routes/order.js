const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getBankDetails,
  verifyPayment
} = require("../controller/order");

const auth = require("../middleware/auth");
const upload = require("../middleware/upload")

// USER
router.post("/", upload.single("screenshot"), auth, createOrder);
router.get("/my", auth, getMyOrders);
router.get("/detail", auth, getBankDetails
);


// ADMIN
router.get("/", auth, getAllOrders);
router.put("/verify/:id", auth, verifyPayment); //


router.put("/update:id", auth, updateOrderStatus);
router.delete("/:id", auth, deleteOrder);

module.exports = router;