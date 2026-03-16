const express = require('express')
const app = express()
const port = 5000
const cors = require("cors")
const cookieparser = require("cookie-parser")
const db = require("../backend/db/connect")
const user = require("../backend/routes/user")
const admin = require("../backend/routes/adminroutes")
const productRoutes = require("../backend/routes/product")
const orderRoutes = require("../backend/routes/order")
const cartRoutes = require("./routes/cart")
const shipment = require("./routes/shipment")
const dotenv = require("dotenv")
dotenv.config()

db()
app.use(express.json());
app.use(cors())
app.use(cookieparser())

// user routes?
app.use("/api/v2/user", user)
// admin routes?
app.use("/api/v2/admin", admin)/
// productt
app.use("/api/v2/product", productRoutes)
// cart?
app.use("/api/v2/cart", cartRoutes)
// order?
app.use("/api/v2/order", orderRoutes);

// shipment
app.use("/api/v2/shipment", shipment);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
