const Address = require("../models/address");
const { Op } = require("sequelize");

// Get all addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.userId },
    });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Create a new address
exports.createAddress = async (req, res) => {
  try {
    if (!req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      is_default,
      country,
    } = req.body;
    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: req.user.userId } },
      );
    }
    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !postal_code ||
      !country
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingAddress = await Address.findOne({
      where: {
        user_id: req.user.userId,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
      },
    });

    if (existingAddress) {
      return res.status(400).json({ error: "Duplicate address" });
    }

    const address = await Address.create({
      ...req.body,
      user_id: req.user.userId,
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single address by ID
exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { user_id: req.user.userId, address_id: req.params.id },
    });
    if (address) {
      res.status(200).json(address);
    } else {
      res.status(404).json({ error: "Address not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      is_default,
      country,
    } = req.body;
    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !postal_code ||
      !country
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingAddress = await Address.findOne({
      where: {
        user_id: req.user.userId,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        address_id: { [Op.ne]: req.params.id },
      },
    });

    if (existingAddress) {
      return res.status(400).json({ error: "Duplicate address" });
    }

    const [updated] = await Address.update(req.body, {
      where: { user_id: req.user.userId, address_id: req.params.id },
    });
    if (updated) {
      const updatedAddress = await Address.findOne({
        where: { user_id: req.user.userId, address_id: req.params.id },
      });
      res.status(200).json(updatedAddress);
    } else {
      res.status(404).json({ error: "Address not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const deleted = await Address.destroy({
      where: { user_id: req.user.userId, address_id: req.params.id },
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: "Address not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const address = await Address.findOne({
      where: { user_id: req.user.userId, address_id: addressId },
    });
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Set all other addresses to not default
    await Address.update(
      { is_default: false },
      {
        where: { user_id: req.user.userId, address_id: { [Op.ne]: addressId } },
      },
    );

    // Set the selected address to default
    address.is_default = true;
    await address.save();

    res.status(200).json(address);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get default address
exports.getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { user_id: req.user.userId, is_default: true },
    });
    if (address) {
      res.status(200).json(address);
    } else {
      res.status(404).json({ error: "Default address not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
