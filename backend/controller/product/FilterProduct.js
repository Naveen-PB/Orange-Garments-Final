const productModel = require("../../model/productModel");

const FilterProductController = async (req, res) => {
  try {
    const categoryList = req?.body?.category || [];

    const query = {};
    if (categoryList.length > 0) {
      query.category = { $in: categoryList };
    }

    const filterProduct = await productModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      data: filterProduct,
      message: "Filtered Product Data",
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

module.exports = FilterProductController;
