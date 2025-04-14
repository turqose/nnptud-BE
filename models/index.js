const User = require("./user");
const Product = require("./product");
const Review = require("./review");
const ProductInteraction = require("./productInteraction");
const ProductCategory = require("./productCategory");
const Order = require("./order");
const OrderItem = require("./orderItem");
const Category = require("./category");
const ProductImage = require("./productImage");
const Cart = require("./cart");
const CartItem = require("./cartItem");
const Payment = require("./payment");
const Address = require("./address");
const BlogCategory = require("./blogCategory");
const BlogPost = require("./blogPost");
const BlogComment = require("./blogComment");
const Variant = require("./variant");
const VariantType = require("./variantType");

// Associations
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.hasMany(ProductInteraction, { foreignKey: "product_id" });
ProductInteraction.belongsTo(Product, { foreignKey: "product_id" });

// Define association
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: "product_id",
  as: "categories",
});
Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: "category_id",
  as: "products",
});

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasOne(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });

Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Order.hasOne(Payment, { foreignKey: "order_id", as: "payment" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
User.hasMany(Address, { foreignKey: "user_id" });
Address.belongsTo(User, { foreignKey: "user_id" });
Order.belongsTo(Address, { foreignKey: "address_id", as: "address" });
Address.hasMany(Order, { foreignKey: "address_id", as: "orders" });

BlogCategory.hasMany(BlogPost, { foreignKey: "category_id", as: "posts" });
BlogPost.belongsTo(BlogCategory, { foreignKey: "category_id", as: "category" });

// Quan hệ giữa BlogPost và BlogComment (1 - N)
BlogPost.hasMany(BlogComment, { foreignKey: "post_id" });
BlogComment.belongsTo(BlogPost, { foreignKey: "post_id" });

// Quan hệ giữa BlogComment và User (N - 1)
User.hasMany(BlogComment, { foreignKey: "user_id" });
BlogComment.belongsTo(User, { foreignKey: "user_id" });

// quan hệ giữa blog và user (N - 1) với author_id
User.hasMany(BlogPost, { foreignKey: "author_id" });
BlogPost.belongsTo(User, { foreignKey: "author_id" });

// variant và variantType
Variant.belongsTo(VariantType, {
  foreignKey: "variant_type_id",
  as: "variantType",
});
VariantType.hasMany(Variant, { foreignKey: "variant_type_id", as: "variants" });

async function deleteAllData() {
  await Promise.all([
    Review.truncate({ force: true }),
    Order.truncate({ force: true }),
    OrderItem.truncate({ force: true }),
    ProductCategory.truncate({ force: true }),
    ProductInteraction.truncate({ force: true }),
    Category.truncate({ force: true }),
    ProductImage.truncate({ force: true }),
    Product.truncate({ force: true }),
     User.truncate({ force: true }),
  ]);
}

module.exports = {
  User,
  Product,
  Review,
  ProductInteraction,
  ProductCategory,
  Order,
  OrderItem,
   Category,
  deleteAllData,
  ProductImage,
  Cart,
  CartItem,
  Payment,
  Address,
  BlogCategory,
  BlogPost,
  BlogComment,
  Variant,
  VariantType,
};
