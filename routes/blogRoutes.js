const express = require("express");
const {
  getBlogById,
  getAllBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllTags,
  getRecentPost,
} = require("../controllers/blogController");
const { authenticate } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.get("/", getAllBlog);
router.get("/:id", getBlogById);
router.get("/tags/all", getAllTags);
router.get("/recent/all", getRecentPost);
router.post("/", authenticate, upload.single("image"), createBlog);
router.put("/:id", authenticate, upload.single("image"), updateBlog);
router.delete("/:id", authenticate, deleteBlog);

module.exports = router;
