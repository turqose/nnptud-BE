const express = require("express");
const {
  getAllImages,
  getProductByImageName,
  deleteImage,
  searchImage,
} = require("../controllers/imageController");
const upload = require("../middlewares/upload");
const router = express.Router();

router.get("/", getAllImages);
router.get("/:imageName", getProductByImageName);
router.delete("/all/not", deleteImage);
router.post("/search", upload.single("file"), searchImage);

module.exports = router;
