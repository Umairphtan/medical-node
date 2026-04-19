const Cart = require("../models/cart");
const Product = require("../models/product");

// ================= Add To Cart =================
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock"
      });
    }

    // ✅ FIXED: use req.user.userId
    let cartItem = await Cart.findOne({
      user: req.user.userId,
      product: productId
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();

      return res.json({
        success: true,
        message: "Cart updated",
        cartItem
      });
    }

    cartItem = await Cart.create({
      user: req.user.userId,
      product: productId,
      quantity
    });

    res.json({
      success: true,
      message: "Product added to cart",
      cartItem
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= Get Cart =================
exports.getCart = async (req, res) => {
  try {
    // ✅ FIXED: use req.user.userId
    const cart = await Cart.find({ user: req.user.userId }).populate("product");

    res.json({
      success: true,
      cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= Update Cart =================
exports.updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    // ✅ OPTIONAL: verify ownership
    if (cart.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    cart.quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= Remove Cart =================
exports.removeCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    // ✅ OPTIONAL: verify ownership
    if (cart.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await cart.deleteOne();

    res.json({
      success: true,
      message: "Product removed from cart"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};