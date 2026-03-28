// const { use } = require("react");
const usermodel = require("../modals/user")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
//  singup pag ""         

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await usermodel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }
        //  hash password   create for user prvacy
        const hasedpassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = await usermodel.create({ username, email, password: hasedpassword });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// login page?


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user not found  singup plz"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "enter correct password"
            });
        }
        const token = jsonwebtoken.sign({
            userId: user._id
        },
            process.env.SECRET_KEY,
            { expiresIn: "30d" }

        )
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 259200000

        })
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user
        });


    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }



    // logout

}
const logout = async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({
        success: true,
        messge: "logout successfyly"
    })
    res.status(500).json({ success: false, error: error.message });

}




module.exports = { createUser, loginUser, logout }