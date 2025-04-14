const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";
    if (req.baseUrl.includes("/api/category-products")) {
      uploadPath = path.join(uploadPath, "categories");
    } else if (req.baseUrl.includes("/api/products")) {
      uploadPath = path.join(uploadPath, "products");
    } else if (req.baseUrl.includes("/api/banners")) {
      uploadPath = path.join(uploadPath, "banner");
    } else if (req.baseUrl.includes("/api/blogs")) {
      uploadPath = path.join(uploadPath, "blog");
    }

    // Check if directory exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    console.log("Upload path is: ", uploadPath);

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tạo tên file duy nhất
  },
});

// Bộ lọc file (chỉ chấp nhận các định dạng được cho phép)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
  const extension = file.originalname.split(".").pop().toLowerCase();
  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Định dạng file không được hỗ trợ"), false);
  }
};

// Khởi tạo Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Export middleware Multer
module.exports = upload;
