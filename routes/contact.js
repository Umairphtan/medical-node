const express = require("express");
const router = express.Router();
const { submitContact, getContacts } = require("../controller/contact");
const admin = require("../middleware/checkadmin")

// Submit form
router.post("/", submitContact);

// Get all contacts
router.get("/", admin , getContacts);

module.exports = router;