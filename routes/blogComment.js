const express = require("express");
const {
  getBlogComments,

  createBlogComment,

  deleteBlogComment,
} = require("../controllers/blogCommentController");

const router = express.Router();

router.get("/", getBlogComments);
router.post("/", createBlogComment);
router.delete("/:id", deleteBlogComment);

module.exports = router;
