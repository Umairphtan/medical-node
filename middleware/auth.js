const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    // Token can come from cookie or Authorization header
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // ✅ Attach full user object to req
    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = auth;