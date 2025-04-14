const express = require("express");
const {
  getAllVariant,
  updateVariant,
  deleteVariant,
  createVariant,
  getVariantById,
} = require("../controllers/variantController");

const router = express.Router();

router.get("/", getAllVariant);
router.get("/:id", getVariantById);
router.post("/", createVariant);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);

module.exports = router;
