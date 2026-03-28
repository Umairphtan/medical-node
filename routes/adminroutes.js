const express = require("express")
const getuser = require("../controller/admin")
const checkadmin = require("../middleware/checkadmin")

const AdminRoute = express.Router()

AdminRoute.get("/getallusers", checkadmin, getuser)

module.exports = AdminRoute