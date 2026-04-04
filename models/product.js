const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true, // title pe index for fast search
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      index: true, // already indexing
    },

    image: {
      type: String,
    },

    stock: {
      type: Number,
      default: 0,
    },

    /* SOLD COUNT */
    sold: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in-stock", "out-of-stock", "sold-out"],
      default: "in-stock",
      index: true, // status pe index for filtering products
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Compound index for category + status search
productSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Product", productSchema);