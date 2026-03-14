const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
addToCart,
getCart,
updateCart,
removeCart
} = require("../controler/cart");


router.post("/add", auth, addToCart);

router.get("/", auth, getCart);

router.put("/update/:id", auth, updateCart);

router.delete("/remove/:id", auth, removeCart);

module.exports = router;