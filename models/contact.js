const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  message: { type: String, required: true },
}, { timestamps: true });

// Compound index for name + email search
contactSchema.index({ name: 1, email: 1 });

module.exports = mongoose.model("Contact", contactSchema);