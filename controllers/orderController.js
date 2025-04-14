const {
  ProductImage,
  OrderItem,
  Product,
  Payment,
  Order,
  User,
  Address,

  Cart,
} = require("../models");
const crypto = require("crypto-js");
const axios = require("axios");
const { sequelize } = require("../config/db");
const { sendMailOrder } = require("../utils/mailer");
require("dotenv").config();

exports.createOrder = async (req, res) => {
  console.log("Create order: ", req.body);
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    // kieerm tra người dùng có tồn tại không
    const user = await User.findByPk(userId, {
      transaction,
    });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }
    const { items, address_id } = req.body;
    let calculatedTotal = 0;
    if (items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Không có sản phẩm trong giỏ hàng" });
    }
    // Kiểm tra số lượng sản phẩm còn đủ không
    for (let i = 0; i < items.length; i++) {
      const product = await Product.findByPk(items[i].product_id, {
        transaction,
      });
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Sản phẩm ${items[i].product_id} không tồn tại`,
        });
      }
      if (product.inventory < items[i].quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Số lượng sản phẩm ${product.name} không đủ`,
        });
      }
      calculatedTotal += items[i].price * items[i].quantity;
    }

    const order = await Order.create(
      {
        user_id: userId,
        address_id: address_id,
        total_amount: calculatedTotal,
        shipping: req.body.shipping,
      },
      {
        transaction,
      },
    );
    await Payment.create(
      {
        order_id: order.order_id,
        payment_method: req.body.paymentMethod,
        amount: calculatedTotal + req.body.shipping,
        status: "pending",
      },
      {
        transaction,
      },
    );

    // xoá giỏ hàng
    await Cart.destroy({
      where: { user_id: userId },
      transaction,
    });

    let orderDetails = [];
    // tạo order item
    for (let i = 0; i < items.length; i++) {
      const product = await Product.findByPk(items[i].product_id, {
        include: [
          {
            model: ProductImage,
            as: "images",
          },
        ],
        transaction,
      });
      await OrderItem.create(
        {
          order_id: order.order_id,
          product_id: items[i].product_id,
          quantity: items[i].quantity,
          price: items[i].price,
        },
        {
          transaction,
        },
      );
      // cập nhật số lượng sản phẩm
      await product.update(
        { inventory: product.inventory - items[i].quantity },
        {
          transaction,
        },
      );
      orderDetails.push({
        order_id: order.order_id,
        price: items[i].price,
        product_id: items[i].product_id,
        product_name: product.name,
        quantity: items[i].quantity,
        images: product.images[0].url,
      });
    }
    await transaction.commit();
    // Gửi email thông báo đơn hàng
    const emailContext = {
      customerName: user.full_name,
      orderItems: orderDetails.map((item) => ({
        ...item,
        images: item.images, // Đảm bảo URL đầy đủ cho hình ảnh
      })),
      totalPrice: calculatedTotal,
    };
    await sendMailOrder(
      user.email, // Email của khách hàng
      "Order Confirmation",
      emailContext,
    );
    res
      .status(201)
      .json({ data: order, message: "Order created successfully" });
  } catch (error) {
    console.log(error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const userId = req.user.userId;
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  limit: 1,
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
        },
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    // Chuẩn hóa dữ liệu trả về
    const data = orders.map((order) => {
      return {
        order_id: order.order_id,
        total: order.total,
        status: order.payment_status,
        payment: order.payment,
        created_at: order.created_at,
        shipping: order.shipping,
        items: order.items.map((item) => {
          return {
            product: item.product,
            quantity: item.quantity,
          };
        }),
      };
    });
    res.status(200).json({
      total: count,
      pages: Math.ceil(count / limit),
      data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    const order = await Order.findOne({
      where: { user_id: userId, order_id: orderId },
      attributes: [
        "order_id",
        "total_amount",
        "payment_status",
        "created_at",
        "shipping",
      ],

      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  limit: 1,
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
        },
        {
          model: Address,
          as: "address",
        },
        {
          model: User,
          as: "user",
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Chuẩn hóa dữ liệu trả về
    const data = {
      order_id: order.order_id,
      total: order.total_amount,
      shipping: order.shipping,
      status: order.payment_status,
      payment: order.payment,
      created_at: order.created_at,
      address: order.address,
      user: order.user,
      items: order.items.map((item) => {
        return {
          product: item.product,
          quantity: item.quantity,
        };
      }),
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    const { status } = req.body;

    console.log("Update order status: ", status);

    // Find the order
    const order = await Order.findOne({
      where: { user_id: userId, order_id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order status
    order.payment_status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status: ", error);
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { user_id: userId, order_id: orderId },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // xoá các order item
    await OrderItem.destroy({
      where: { order_id: orderId },
    });
    await order.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.paymentWithMomo = async (req, res) => {
  const { orderId, total } = req.body;
  var partnerCode = "MOMOBKUN20180529";
  var accessKey = "klm05TvNBzhg7h7j";
  var secretkey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
  var requestId = partnerCode + new Date().getTime();
  var orderInfo = "pay with MoMo";
  var redirectUrl = `${process.env.API_FRONTEND || "http://localhost:4000"}/cart?step=3`;

  var ipnUrl = `${process.env.API_BACKEND || "https://d9cd-116-110-113-2.ngrok-free.app"}/api/orders/callback-with-momo`;
  var amount = total;
  var requestType = "payWithMethod";
  var extraData = "";
  console.log("Request to MoMo: ", req.body);

  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

  const signature = crypto
    .HmacSHA256(rawSignature, secretkey)
    .toString(crypto.enc.Hex);

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  // options for axios
  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };
  console.log("Request to MoMo: ", options);
  let result;
  try {
    result = await axios(options);
    if (result.data.resultCode !== 0) {
      res.status(400).json(result.data);
    }
    res.status(200).json(result.data.payUrl);
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};
exports.callbackMomo = async (req, res) => {
  try {
    console.log("Callback from MoMo: ", req.body);
    const { orderId, resultCode } = req.body;
    if (resultCode === 0) {
      const order = await Order.findOne({ where: { id: orderId } });

      if (order) {
        order.payment_status = "Paid";
        await order.save();
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    }
    res.status(200).json({ message: "Callback from MoMo" });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.receiveCallbackMomo = async (req, res) => {
  try {
    console.log("Callback from MoMo: ", req.body);
    const { orderId, resultCode } = req.body;
    if (resultCode === 0) {
      const order = await Order.findOne({ where: { id: orderId } });

      if (order) {
        order.payment_status = "payment_success";
        await order.save();
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    }
    res.status(200).json({ message: "Callback from MoMo" });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// admin
exports.getAllOrdersAdmin = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const { count, rows: orders } = await Order.findAndCountAll({
      attributes: ["order_id", "total_amount", "payment_status", "created_at"],
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "price", "product_id"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  limit: 1,
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
        },
        {
          model: User,
          as: "user",
          attributes: ["full_name", "email"],
        },
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    // Chuẩn hóa dữ liệu trả về
    const data = orders.map((order) => {
      return {
        order_id: order.order_id,
        total: order.total_amount,
        status: order.payment_status,
        payment: order.payment,
        user: order.user,
        created_at: order.created_at,
        items: order.items.map((item) => {
          return {
            product: item.product,
            quantity: item.quantity,
          };
        }),
      };
    });
    res.status(200).json({
      total: count,
      pages: Math.ceil(count / limit),
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  limit: 1,
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
        },
        {
          model: Address,
          as: "address",
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Chuẩn hóa dữ liệu trả về
    const data = {
      order_id: order.order_id,
      total: order.total,
      status: order.status,
      payment: order.payment,
      address: order.address,
      shipping: order.shipping,
      items: order.items.map((item) => {
        return {
          product: item.product,
          quantity: item.quantity,
        };
      }),
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.updateOrderStatusAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    console.log("---------------------------------");
    const order = await Order.findOne({
      where: { order_id: orderId },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    order.payment_status = status;
    await order.save();
    res.status(200).json({ message: "Update order status successfully" });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.deleteOrderAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { order_id: orderId },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // xoá các order item
    await OrderItem.destroy({
      where: { order_id: orderId },
    });
    await order.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};
