const express = require("express");
const admin = require("../middleware/checkadmin")

const router = express.Router();

const {
createProduct,
getProducts,
getCategoryProducts,
updateProduct,
deleteProduct,
getBestSellingProducts ,
getProductById
} = require("../controller/product");

const upload = require("../middleware/multer");


// CREATE PRODUCT
router.post("/create", admin,  upload.single("image"), createProduct);

// GET ALL
router.get("/",  getProducts);

// CATEGORY
router.get("/category/:category", getCategoryProducts);

// best seling
router.get("/best-selling", getBestSellingProducts);

// UPDATE
router.put("/update/:id", admin  , updateProduct);



// routes/product.js
router.get("/:id", getProductById);
// DELETE
router.delete("/delete/:id", admin, deleteProduct);

module.exports = router;