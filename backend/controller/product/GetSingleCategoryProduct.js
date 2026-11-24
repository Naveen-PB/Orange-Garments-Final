const productModel = require("../../model/productModel");

const GetCategoryProductController = async (req, res) => {
  try {
    const categories = await productModel.distinct("category");
    const productCategory = [];

    for (const category of categories) {
      const product = await productModel.findOne({ category });
      if (product) {
        productCategory.push(product);
      }
    }

    res.status(200).json({
      data: productCategory,
      message: "Product Category List",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = GetCategoryProductController;
