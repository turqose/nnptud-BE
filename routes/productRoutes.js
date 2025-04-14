const express = require("express");
const {
  bulkCreateProducts,
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  getProductBySlug,
  createReview,
  searchProducts,
  getAllProducts,
} = require("../controllers/productController.js");
const upload = require("../middlewares/upload.js");
const { syncProductView } = require("../controllers/productViewController.js");
const { authenticate } = require("../middlewares/auth.js");

const router = express.Router();

router.post("/", upload.array("images"), createProduct);
router.post("/review", authenticate, createReview);
router.get("/search", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);
router.put("/:id", upload.array("images"), updateProduct);
router.delete("/:id", deleteProduct);
router.post("/bulk", bulkCreateProducts);
router.delete("/all/bulk", bulkDeleteProducts);
router.post("/sync", authenticate, syncProductView);
router.get("/export/data", getAllProducts);
module.exports = router;
