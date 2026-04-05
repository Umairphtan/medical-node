const Contact = require("../models/contact");
const redis = require("../db/redis"); // tumhare Redis ka client path

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // DB me create
    const contact = await Contact.create({ name, email, message });

    await redis.del("contacts_all");

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      data: contact
    });

  } catch (err) {
    console.error("❌ submitContact Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 Get all contacts (with Redis caching)
exports.getContacts = async (req, res) => {
  try {
    const cacheKey = "contacts_all";
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡ Contacts from Redis");
      return res.status(200).json(JSON.parse(cached));
    }

    // DB fetch
    const contacts = await Contact.find().sort({ createdAt: -1 });

    const response = {
      success: true,
      message: "Contacts fetched successfully",
      data: contacts
    };

    // Redis me store karo TTL ke saath
    await redis.set(cacheKey, JSON.stringify(response), "EX", 60 * 60); // 1 hour

    console.log("🐢 Contacts from MongoDB");
    return res.status(200).json(response);

  } catch (err) {
    console.error("❌ getContacts Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};