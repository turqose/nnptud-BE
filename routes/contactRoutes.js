const express = require("express");
const { createContact, getAll } = require("../controllers/contactController");

const router = express.Router();

router.get("/", getAll);
router.post("/", createContact);

module.exports = router;
