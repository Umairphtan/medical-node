const Contact = require("../models/contact");
const redis = require("../db/redis");

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Create in DB
    const contact = await Contact.create({ name, email, message });

    // Invalidate cached contacts
    await redis.del("contacts:all");

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      data: contact
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all contacts (with Redis cache)
exports.getContacts = async (req, res) => {
  try {
    const cacheKey = "contacts:all";
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        message: "Contacts fetched from cache",
        data: JSON.parse(cached)
      });
    }

    const contacts = await Contact.find().sort({ createdAt: -1 });

    await redis.set(cacheKey, JSON.stringify(contacts), "EX", 60 * 60); // cache 1 hour

    res.status(200).json({
      success: true,
      message: "Contacts fetched from DB",
      data: contacts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};