const express = require("express");
const {
  bulkCreateCategories,
  bulkDeleteCategories,
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} = require("../controllers/categoryController");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/", upload.single("image"), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);
router.post("/bulk", bulkCreateCategories);
router.delete("/bulk", bulkDeleteCategories);

module.exports = router;
