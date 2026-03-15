const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/checkadmin");

const {
buyNow,
getMyOrders,
getAllOrders,
updateOrderStatus,
deleteOrder
} = require("../controler/order");


/* USER */

router.post("/buy", auth, buyNow);

router.get("/myorder", auth, getMyOrders);


/* ADMIN */

router.get("/admin/orders", auth, admin, getAllOrders);

router.put("/admin/update/:id", auth, admin , updateOrderStatus);

router.delete("/admin/delete/:id", auth, admin, deleteOrder);

module.exports = router;