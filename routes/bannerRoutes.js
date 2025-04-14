const express = require("express");
const {
  getBannerById,
  getAllBanner,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController.js");
const { authenticate } = require("../middlewares/auth.js");
const upload = require("../middlewares/upload.js");

const router = express.Router();

router.get("/", getAllBanner);
router.get("/:id", getBannerById);
router.post("/", authenticate, upload.single("image"), createBanner);
router.put("/:id", authenticate, upload.single("image"), updateBanner);
router.delete("/:id", authenticate, deleteBanner);

module.exports = router;
