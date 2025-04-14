const { User } = require("../models");

exports.allUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const users = await User.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    res.status(200).json({
      total: users.count,
      pages: Math.ceil(users.count / limit),
      data: users.rows,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.user.userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.update(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// seed admin
exports.seedAdmin = async (req, res) => {
  try {
    const user = await User.create({
      full_name: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
      is_admin: true,
      role: "admin",
      isVerified: true,
    });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
