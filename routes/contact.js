const express = require("express");
const router = express.Router();
const { submitContact, getContacts } = require("../controller/contact");

// Submit form
router.post("/", submitContact);

// Get all contacts
router.get("/", getContacts);

module.exports = router;