const mongoDb = "mongodb://localhost:27017/umair"
const mongoose = require("mongoose")



function Connect() {
    mongoose.connect(mongoDb).then(() => console.log("data has been connected")).catch(() => console.log("data has been not connected"))
}

module.exports = Connect