const express = require("express");
const router = express.Router();
const { checkoutWithShipment } = require("../controler/shipment");
const auth = require("../middleware/auth"); // default export

// POST /api/shipment/checkout
router.post("/checkout", auth, checkoutWithShipment);

module.exports = router;