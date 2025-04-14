const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authenticate } = require("../middlewares/auth");

// Create a new address
router.post("/", authenticate, addressController.createAddress);

// Get all addresses for a user
router.get("/", authenticate, addressController.getAddresses);

// Get a single address by ID
router.get("/:id", authenticate, addressController.getAddressById);

router.get("/default", authenticate, addressController.getDefaultAddress);

router.put("/default/:id", authenticate, addressController.setDefaultAddress);
// Update an address
router.put("/:id", authenticate, addressController.updateAddress);

// Delete an address
router.delete("/:id", authenticate, addressController.deleteAddress);

module.exports = router;
