const productModel = require("../../model/productModel");

const SearchProductController = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return res.status(200).json({
        data: [],
        message: "No search query provided",
        error: false,
        success: true,
      });
    }

    const regex = new RegExp(query.trim(), "i");

    const searchProd = await productModel.find({
      $or: [
        { productName: regex },
        { brandName: regex },
        { category: regex },
        { productDesc: regex },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      data: searchProd,
      message: "Search Product data",
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

module.exports = SearchProductController;
