const Order = require("../modals/order");
const Product = require("../modals/product");
const mongoose = require("mongoose"); 
const Cart = require("../modals/cart");
/// CREATE ORDER (BUY NOW + CART)
exports.createOrder = async (req, res) => {
  try {
    const { products, shipping, paymentMethod, bankAccount } = req.body;

    // ✅ BASIC VALIDATION
    if (!products || products.length === 0)
      return res.status(400).json({
        success: false,
        message: "Products are required",
      });

    if (
      !shipping?.name ||
      !shipping?.phone ||
      !shipping?.address ||
      !shipping?.city
    )
      return res.status(400).json({
        success: false,
        message: "All shipping fields are required",
      });

const method = paymentMethod?.toUpperCase();
if (!["COD", "BANK"].includes(method))
  return res.status(400).json({
    success: false,
    message: "Invalid payment method",
  });

// BANK ACCOUNT VALIDATION
if (method === "BANK") {
  if (!bankAccount) {
    return res.status(400).json({
      success: false,
      message: "Bank account number is required for BANK payment",
    });
  }

  // ✅ STRICT FORMAT CHECK (example: 10-16 digit numeric)
  const accountRegex = /^[0-9]{10,16}$/;
  if (!accountRegex.test(bankAccount)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid bank account number. Must be 10-16 digits numeric.",
    });
  }
}

    let totalPrice = 0;
    const updatedProducts = [];

    // ✅ LOOP PRODUCTS & SAFE STOCK UPDATE
    for (let item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId))
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });

      const product = await Product.findById(item.productId);

      if (!product)
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });

      if (product.stock < item.quantity)
        return res.status(400).json({
          success: false,
          message: `${product.title} is out of stock`,
        });

      // ✅ BACKEND PRICE CALCULATION
      totalPrice += product.price * item.quantity;

      // ✅ STOCK & SOLD UPDATE
      product.stock -= item.quantity;
      product.sold += item.quantity;
      product.status = product.stock > 0 ? "in-stock" : "out-of-stock";

      await product.save();

      updatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // ✅ CREATE ORDER
    const order = await Order.create({
      user: req.user?.id,
      products: updatedProducts,
      totalPrice, // calculated by backend
      shipping,
      paymentMethod: method,
      bankAccount: method === "BANK" ? bankAccount : "",
      paymentStatus: "pending", // always pending until verified
      orderStatus: "pending",
    });

    await Cart.deleteMany({ user: req.user?.id });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/// ADMIN: GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/// UPDATE ORDER STATUS (ADMIN)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/// DELETE ORDER (ADMIN)
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Order deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};