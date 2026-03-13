const Product = require("../modals/product");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {

    const { title, description, price, category, stock } = req.body;

    // VALIDATION
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
      image: req.file.filename
    });

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

    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });

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

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required"
      });
    }

    const products = await Product.find({ category });

    res.status(200).json({
      success: true,
      message: "Category products fetched",
      data: products
    });

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