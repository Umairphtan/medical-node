const Product = require("../modals/product");
const mongoose = require("mongoose");


/// CREATE PRODUCT
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
      image: req.file.filename,

      // BEST SELLING SYSTEM
      sold: 0,
      status: stock > 0 ? "in-stock" : "out-of-stock"
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
exports.getBestSellingProducts = async (req,res)=>{

try{

const products = await Product
.find()
.sort({ sold: -1 })
.limit(10);

res.status(200).json({
success:true,
products
})

}catch(error){

res.status(500).json({
success:false,
message:error.message
})

}

}
// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("👉 Incoming ID:", id); // DEBUG

    // 🔒 Check ID exists
    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // 🔒 Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    // 🔍 Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Success
    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error("❌ getProductById Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};