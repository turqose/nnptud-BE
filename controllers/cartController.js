const { Cart, CartItem, Product, ProductImage } = require("../models");

// Lấy thông tin giỏ hàng của người dùng
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy user_id từ token
    if (!userId) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: ProductImage,
                  as: "images",
                },
              ],
            },
          ], // Lấy thông tin sản phẩm trong giỏ hàng
        },
      ],
    });

    if (!cart) {
      return res.status(402).json({ message: "Giỏ hàng không tồn tại" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy user_id từ token
    const { productId, quantity } = req.body;

    // kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra số lượng sản phẩm còn đủ không
    if (product.inventory < quantity) {
      return res.status(400).json({ message: "Số lượng sản phẩm không đủ" });
    }

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ where: { user_id: userId } });

    // Nếu không có giỏ hàng, tạo mới
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingCartItem = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id: productId },
    });

    if (existingCartItem) {
      // Nếu đã có, cập nhật số lượng
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      // Nếu chưa có, thêm mới
      await CartItem.create({
        cart_id: cart.cart_id,
        product_id: productId,
        quantity,
        price: product.price * (1 - product.discount / 100),
      });
    }

    res.status(201).json({ message: "Thêm sản phẩm vào giỏ hàng thành công" });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    console.log(req.body);
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    // Tìm cart item
    const cartItem = await CartItem.findByPk(cartItemId);

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    // Cập nhật số lượng
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    if (!cartItemId) {
      return res.status(400).json({ message: "Thiếu cartItemId" });
    }

    // Xóa cart item
    await CartItem.destroy({ where: { cart_item_id: cartItemId } });

    res.status(200).json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  } catch (error) {
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
