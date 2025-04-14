const express = require("express");
const {
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder,
  updateOrderStatus,
  paymentWithMomo,
  getAllOrdersAdmin,
  deleteOrderAdmin,
  updateOrderStatusAdmin,
  callbackMomo,
} = require("../controllers/orderController");
const { authenticate } = require("../middlewares/auth");
const router = express.Router();

router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.post("/", authenticate, createOrder);
router.patch("/:id", authenticate, updateOrderStatus);
router.post("/payment-with-momo", authenticate, paymentWithMomo);
router.post("/callback-with-momo", authenticate, callbackMomo);
router.delete("/:id", authenticate, deleteOrder);
// admin routes
router.get("/admin/all", getAllOrdersAdmin);
router.put("/admin/:id", authenticate, updateOrderStatusAdmin);
router.delete("/admin/:id", authenticate, deleteOrderAdmin);

module.exports = router;
