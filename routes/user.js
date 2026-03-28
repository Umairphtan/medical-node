const express = require("express")

const { createUser, loginUser, logout } = require("../controller/user")

const router = express.Router()



router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/logout", logout);





module.exports = router