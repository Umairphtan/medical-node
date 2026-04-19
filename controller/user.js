const usermodel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await usermodel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = await usermodel.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" } // Short-lived access token
        );

        const refreshToken = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "30d" } // Long-lived refresh token
        );

        // Save refresh token to DB
        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Remove password from response
        const userResponse = { ...newUser._doc };
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "30d" }
        );

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Remove password
        const userResponse = { ...user._doc };
        delete userResponse.password;

        // Set httpOnly cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await usermodel.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Token refreshed",
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(403).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await usermodel.findById(decoded.userId);
            
            if (user && user.refreshToken === refreshToken) {
                user.refreshToken = null;
                await user.save();
            }
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
};

module.exports = { createUser, loginUser, refreshAccessToken, logout };