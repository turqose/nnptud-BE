const ContactForm = require("../models/contactForm");
const { sendMailContact } = require("../utils/mailer");

exports.createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const contact = await ContactForm.create({
      name,
      email,
      message,
    });
    await sendMailContact({ name, email, message });
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const contacts = await ContactForm.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    res.status(200).json({
      total: contacts.count,
      pages: Math.ceil(contacts.count / limit),
      data: contacts.rows,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
