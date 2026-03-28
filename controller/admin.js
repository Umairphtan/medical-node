const usermodel = require("../modals/user")

const getuser = async (req, res) => {
    try {
        const users = await usermodel.find()
        if (!users) {
            return res.status(404).json({
                suucess: false,
                messege: "user not found"
            })
        }
        return res.status(200).json({
            suucess: true,
            users
        })

    } catch (error) {
        return res.status(500).json({
            suucess: false,
            messege: "internal server error "
        })

    }

}

module.exports = getuser
