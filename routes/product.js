const express = require("express");
const admin = require("../middleware/checkadmin")

const router = express.Router();

const {
createProduct,
getProducts,
getCategoryProducts,
updateProduct,
deleteProduct
} = require("../controler/product");

const upload = require("../middleware/multer");


// CREATE PRODUCT
router.post("/create", admin,  upload.single("image"), createProduct);

// GET ALL
router.get("/",  getProducts);

// CATEGORY
router.get("/category/:category", getCategoryProducts);

// UPDATE
router.put("/update/:id", updateProduct);

// DELETE
router.delete("/delete/:id", deleteProduct);

module.exports = router;