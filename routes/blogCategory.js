const router = require("express").Router();

const {
  getBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  createBulkBlogCategories,
} = require("../controllers/blogCategoryController");

router.get("/", getBlogCategories);
router.get("/:id", getBlogCategoryById);
router.post("/", createBlogCategory);
router.post("/bulk", createBulkBlogCategories);
router.put("/:id", updateBlogCategory);
router.delete("/:id", deleteBlogCategory);

module.exports = router;
