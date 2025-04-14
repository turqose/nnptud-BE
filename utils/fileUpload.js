const axios = require("axios");
const fs = require("fs");
const path = require("path");

const processFileUploads = (files) => {
  return files.map((file) => {
    return `/uploads/${file.filename + path.extname(file.originalname)}`;
  });
};

const deleteFiles = (files) => {
  if (files) {
    files.forEach((file) => {
      fs.unlinkSync(file);
    });
  }
};
const deleteFile = (file) => {
  if (file && fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
};
const downloadImage = async (url, sku) => {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    const imagePath = path.join(__dirname, "uploads", `${sku}.jpg`); // Lưu ảnh với tên là SKU
    response.data.pipe(fs.createWriteStream(imagePath));
    return `/uploads/${sku}.jpg`; // Trả về đường dẫn ảnh
  } catch (error) {
    console.error(`Error downloading image for SKU ${sku}:`, error);
    return null;
  }
};

module.exports = { processFileUploads, deleteFiles, deleteFile, downloadImage };
