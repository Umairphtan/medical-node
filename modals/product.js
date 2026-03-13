const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      required: true,
      index: true
    },

    image: {
      type: String
    },

    stock: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["in-stock", "out-of-stock", "sold-out"],
      default: "in-stock"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);