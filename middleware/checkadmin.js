const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const Admin = async (req, res, next) => {
    try {
        const token = req.cookies.token;    

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await UserModel.findById(decoded.userId);   
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: User is not admin"
            });
        }

        req.user = user; 
        next();          
    } catch (error) {
        console.error("Admin middleware error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = Admin;
