const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  address: { type: String, required: true },
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String
}, { timestamps: true });

module.exports = mongoose.model("Shipment", shipmentSchema);