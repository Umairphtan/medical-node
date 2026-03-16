const Product = require("../modals/product");
const Order = require("../modals/order");
const Shipment = require("../modals/shipment");

exports.checkoutWithShipment = async (req, res) => {
  try {
    const { productId, quantity, address, city, state, postalCode, country, phone, paymentMethod } = req.body;

    if (!address || !city || !state || !postalCode || !country || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all shipment details before placing order"
      });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (product.stock === 0 || product.status === "out-of-stock")
      return res.status(400).json({ success: false, message: "Product is out of stock" });

    if (product.stock < quantity)
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });

    const shipment = await Shipment.create({ user: req.user._id, address, city, state, postalCode, country, phone });

    const total = product.price * quantity;
    const order = await Order.create({
      user: req.user._id,
      product: product._id,
      shipment: shipment._id,
      quantity,
      price: product.price,
      total,
      paymentMethod: paymentMethod || "cash" // default cash
    });

    shipment.order = order._id;
    await shipment.save();

    product.stock -= quantity;
    if (product.stock === 0) product.status = "sold-out";
    await product.save();

    res.status(200).json({ success: true, message: "Order placed successfully", order, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};