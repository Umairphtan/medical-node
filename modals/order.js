const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"admin",
required:true
},

product:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product",
required:true
},

quantity:{
type:Number,
required:true,
default:1
},

price:{
type:Number,
required:true
},

total:{
type:Number,
required:true
},

status:{
type:String,
enum:["pending","confirmed","cancelled"],
default:"pending"
}

},
{
timestamps:true
}
);

module.exports = mongoose.model("Order",orderSchema);