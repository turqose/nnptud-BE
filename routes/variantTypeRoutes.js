const express = require("express");
const {
  getAllVariantTypes,
  deleteVariantType,
  updateVariantType,
  createVariantType,
  getVariantTypeById,
} = require("../controllers/variantTypeController");
const router = express.Router();

router.get("/", getAllVariantTypes);
router.get("/:id", getVariantTypeById);
router.post("/", createVariantType);
router.put("/:id", updateVariantType);
router.delete("/:id", deleteVariantType);

module.exports = router;
