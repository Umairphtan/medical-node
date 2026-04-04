// middleware/auth.js
const jwt = require("jsonwebtoken");
// const User = require("../modals/order");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ success: false, message: "No token provided" });

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ success: false, message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

module.exports = auth;