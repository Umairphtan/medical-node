const Product = require("../modals/product");
const Order = require("../modals/order");


exports.buyNow = async (req,res)=>{

try{

const {productId, quantity} = req.body;

const product = await Product.findById(productId);

if(!product){

return res.status(404).json({
success:false,
message:"Product not found"
})

}


/* ===== STOCK CHECK ===== */

if(product.stock === 0 || product.status === "out-of-stock"){

return res.status(400).json({
success:false,
message:"Product is out of stock"
})

}

if(product.stock < quantity){

return res.status(400).json({
success:false,
message:`Only ${product.stock} items available`
})

}


/* ===== CREATE ORDER ===== */

const total = product.price * quantity;

const order = await Order.create({

user:req.user._id,
product:product._id,
quantity,
price:product.price,
total

});


/* ===== UPDATE STOCK ===== */

product.stock -= quantity;

if(product.stock === 0){

product.status = "sold-out";

}

await product.save();


res.status(200).json({

success:true,
message:"Order placed successfully",
order

})


}catch(err){

res.status(500).json({
success:false,
message:err.message
})

}

}
exports.getMyOrders = async (req,res)=>{

try{

const orders = await Order.find({
user:req.user._id
})
.populate("product");

res.json({
success:true,
orders
})

}catch(err){

res.status(500).json({
success:false,
message:err.message
})

}

}

// admin get all
exports.getAllOrders = async (req,res)=>{

try{

const orders = await Order.find()
.populate("product")
.populate("user","username email")
.sort({createdAt:-1})

res.json({
success:true,
total:orders.length,
orders
})

}catch(err){

res.status(500).json({
success:false,
message:err.message
})

}

}
//  updated
exports.updateOrderStatus = async (req,res)=>{

try{

const {status} = req.body

const order = await Order.findById(req.params.id)

if(!order){
return res.status(404).json({
success:false,
message:"Order not found"
})
}

order.status = status

await order.save()

res.json({
success:true,
message:"Order updated",
order
})

}catch(err){

res.status(500).json({
success:false,
message:err.message
})

}

}

// delete
exports.deleteOrder = async (req,res)=>{

try{

const order = await Order.findById(req.params.id)

if(!order){

return res.status(404).json({
success:false,
message:"Order not found"
})

}

await order.deleteOne()

res.json({
success:true,
message:"Order deleted successfully"
})

}catch(err){

res.status(500).json({
success:false,
message:err.message
})

}

}