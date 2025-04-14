require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const fs = require("fs");
const { sequelize } = require("./config/db");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const blogCategory = require("./routes/blogCategory");
const blogComment = require("./routes/blogComment");
const app = express();
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const session = require("express-session");

// ...existing code...
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({ origin: "*" })); // Hoặc cấu hình domain cụ thể
app.use(morgan("dev"));
app.use(helmet());
app.use(
  session({
    secret: "keyboard cat",
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  }),
);

// Middleware to set crossOrigin for images
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads"),
);

// cấu hình view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(function (req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Thay * bằng domain của frontend nếu cần
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Cho phép React tải tài nguyên từ Node.js
  next();
});

app.use(passport.authenticate("session"));

app.use((err, req, res, next) => {
  // Added 'next' parameter
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Giới hạn 100 requests/IP
});
app.use(passport.initialize());
app.use(passport.session());

app.use(limiter);
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the E-commerce API",
    backend: process.env.API_BACKEND,
    frontend: process.env.API_FRONTEND,
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/category-products", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/category-blogs", blogCategory);
app.use("/api/blog-comments", blogComment);
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/variants", require("./routes/variantRoutes"));
app.use("/api/variant-types", require("./routes/variantTypeRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/images", require("./routes/imageRoutes"));
app.delete("/api/delete-all-data", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    // xoá các file trong thư mục uploads
    await fs.promises.rmdir("uploads", { recursive: true });
    await fs.promises.mkdir("uploads");
    await fs.promises.mkdir("uploads/banner");
    await fs.promises.mkdir("uploads/blog");
    await fs.promises.mkdir("uploads/categories");
    await fs.promises.mkdir("uploads/products");

    res.status(200).json({ message: "All data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete all data" });
  }
});

const PORT = process.env.PORT || 3000;
sequelize
  .sync({
    // force: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
