const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middlewares/auth");

// Sử dụng middleware xác thực token cho tất cả các route giỏ hàng

// Lấy thông tin giỏ hàng của người dùng
router.get("/", authenticate, cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authenticate, cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/items/:cartItemId", authenticate, cartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
router.delete(
  "/items/:cartItemId",
  authenticate,
  cartController.removeFromCart,
);

module.exports = router;
