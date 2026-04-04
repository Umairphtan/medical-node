const Order = require("../models/order");
const Product = require("../models/product");
const Cart = require("../models/cart");
const mongoose = require("mongoose");

const BANK_INFO = {
  accountName: "farida jubeen",
  accountNumber: "00060900007335",
  bankName: "askari bank",
  branch: "Main Branch",
};

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    // ⚠️ req.body me FormData aayega => shipping/products JSON string hoga
    const products = req.body.products ? JSON.parse(req.body.products) : [];
    const shipping = req.body.shipping ? JSON.parse(req.body.shipping) : null;
    const paymentMethod = req.body.paymentMethod?.toUpperCase();

    // ✅ VALIDATION
    if (!products || products.length === 0)
      return res.status(400).json({ success: false, message: "Products required" });

    if (!shipping || !shipping.name?.trim() || !shipping.phone?.trim() || !shipping.address?.trim() || !shipping.city?.trim())
      return res.status(400).json({ success: false, message: "All shipping fields are required" });

    if (!["COD", "BANK"].includes(paymentMethod))
      return res.status(400).json({ success: false, message: "Invalid payment method" });

    // BANK PAYMENT => screenshot required
    if (paymentMethod === "BANK" && !req.file)
      return res.status(400).json({ success: false, message: "Bank screenshot required" });

    let totalPrice = 0;
    const updatedProducts = [];

    for (let item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId))
        return res.status(400).json({ success: false, message: "Invalid product ID" });

      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ success: false, message: "Product not found" });

      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `${product.title} out of stock` });

      totalPrice += product.price * item.quantity;
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();

      updatedProducts.push({ productId: product._id, quantity: item.quantity });
    }
    const order = await Order.create({
      user: req.user.id,
      products: updatedProducts,
      totalPrice,
      shipping,
      paymentMethod,
      bankAccount: paymentMethod === "BANK" ? BANK_INFO.accountNumber : "",
      paymentScreenshot: req.file ? req.file.path : "",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    await Cart.deleteMany({ user: req.user.id });

    res.status(201).json({ success: true, message: "Order placed", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.productId", "title price image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BANK DETAILS
exports.getBankDetails = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: BANK_INFO });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN ROUTES
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("products.productId").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
};

exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status }, { new: true });
  res.status(200).json({ success: true, data: order });
};

exports.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Order deleted" });
};

exports.verifyPayment = async (req, res) => {
  try {
    const { action } = req.body; // approve or reject
    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ success: false, message: "Invalid action" });

    const update = action === "approve" ? { paymentStatus: "paid" } : { paymentStatus: "rejected" };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: "after" }
    );

    res.status(200).json({
      success: true,
      message: `Payment ${action}ed successfully`,
      data: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};