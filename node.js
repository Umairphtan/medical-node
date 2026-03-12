const express = require('express')
const app = express()
const port = 5000
const cors = require("cors")
const cookieparser = require("cookie-parser")
const db = require("../backend/db/connect")
const user = require("../backend/routes/user")
const admin = require("../backend/routes/adminroutes")
const dotenv = require("dotenv")
dotenv.config()

db()
app.use(express.json());
app.use(cors())
app.use(cookieparser())



// user routes?
app.use("/api/v1/user", user)
// admin routes?
app.use("/api/v1/admin", admin)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
