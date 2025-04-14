#!/bin/bash

# Thư mục gốc của dự án
PROJECT_DIR="ecommerce-app"

# Danh sách thư mục cần tạo
FOLDERS=(
    "src/config"
    "src/controllers"
    "src/models"
    "src/routes"
    "src/services"
    "src/middlewares"
    "src/utils"
    "src/views"
    "src/public"
)

# Danh sách file cần tạo
FILES=(
    ".env"
    "server.js"
    "package.json"
    "README.md"
    "src/config/db.js"
    "src/controllers/authController.js"
    "src/controllers/productController.js"
    "src/models/UserModel.js"
    "src/models/ProductModel.js"
    "src/routes/authRoutes.js"
    "src/routes/productRoutes.js"
    "src/services/productService.js"
    "src/middlewares/authMiddleware.js"
    "src/utils/helper.js"
)

# Danh sách package cần cài đặt
DEPENDENCIES=(
    "express"
    "mongoose"
    "dotenv"
    "cors"
    "jsonwebtoken"
    "bcryptjs"
    "morgan"
)

DEV_DEPENDENCIES=(
    "nodemon"
)

# Tạo thư mục
for folder in "${FOLDERS[@]}"; do
    mkdir -p "$PROJECT_DIR/$folder"
    echo "📂 Đã tạo thư mục: $PROJECT_DIR/$folder"
done

# Tạo file
for file in "${FILES[@]}"; do
    touch "$PROJECT_DIR/$file"
    echo "📄 Đã tạo file: $PROJECT_DIR/$file"
done

# Khởi tạo package.json
cd "$PROJECT_DIR" || exit
npm init -y

# Cài đặt dependencies
npm install "${DEPENDENCIES[@]}"
npm install --save-dev "${DEV_DEPENDENCIES[@]}"

# In ra thông báo hoàn tất
echo "✅ Cấu trúc thư mục, file và cài đặt dependencies hoàn tất!"
