const Product = require("../models/product");
const mongoose = require("mongoose");
const redis = require("../db/redis");

/// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    if (!title || !description || !price || !category || !stock) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required"
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      image: req.file.filename,
      sold: 0,
      status: stock > 0 ? "in-stock" : "out-of-stock"
    });

    // 🔥 CACHE CLEAR
    await redis.del("products_all");
    await redis.del("best_products");
    await redis.del(`category_${category}`);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const cacheKey = "products_all";

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("⚡ Products from Redis");
      return res.status(200).json(JSON.parse(cachedData));
    }

    const products = await Product.find().sort({ createdAt: -1 });

    const response = {
      success: true,
      message: "Products fetched successfully",
      data: products
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

    console.log("🐢 Products from MongoDB");

    res.status(200).json(response);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// GET CATEGORY PRODUCTS
exports.getCategoryProducts = async (req, res) => {
  try {
    const { category } = req.params;
    const cacheKey = `category_${category}`;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required"
      });
    }

    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡ Category from Redis");
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.find({ category });

    const response = {
      success: true,
      message: "Category products fetched",
      data: products
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

    console.log("🐢 Category from MongoDB");

    res.status(200).json(response);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 🔥 CACHE CLEAR
    await redis.del("products_all");
    await redis.del(`product_${req.params.id}`);
    await redis.del("best_products");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 🔥 CACHE CLEAR
    await redis.del("products_all");
    await redis.del(`product_${req.params.id}`);
    await redis.del("best_products");

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// BEST SELLING PRODUCTS
exports.getBestSellingProducts = async (req, res) => {
  try {
    const cacheKey = "best_products";

    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡ Best selling from Redis");
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(10);

    const response = {
      success: true,
      products,
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 180);

    console.log("🐢 Best selling from MongoDB");

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product_${id}`;

    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡ Single Product from Redis");
      return res.status(200).json(JSON.parse(cached));
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const response = {
      success: true,
      data: product,
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

    console.log("🐢 Single Product from MongoDB");

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ getProductById Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};