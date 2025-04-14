const ProductView = require("../models/productView");

exports.syncProductView = async (req, res) => {
  try {
    const { viewedProducts } = req.body;
    const user_id = req.user.user_id;
    const insertData = viewedProducts.map((product_id) => {
      return {
        product_id,
        user_id,
      };
    });
    await ProductView.bulkCreate(insertData, {
      updateOnDuplicate: ["view_count", "view_date"],
    });
    res.status(200).json({ message: "Product view synced successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};
