const express = require("express");
const {
  allUsers,
  getUserById,
  deleteUser,
  updateUser,
  seedAdmin,
} = require("../controllers/userController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();
router.get("/all", allUsers);
router.get("/:id", getUserById);
router.put("/update", authenticate, updateUser);
router.delete("/delete/:email", deleteUser);
router.post("/add/admin", seedAdmin);

module.exports = router;
