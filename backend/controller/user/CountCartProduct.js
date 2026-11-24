const cartModel = require("../../model/Cart");

const CountCartProductController = async (req, res) => {
  try {
    const currentUser = req?.userId || req?.params?.id;

    if (!currentUser) {
      return res.status(200).json({
        data: [],
        count: 0,
        message: "No user authenticated",
        error: false,
        success: true,
      });
    }

    const rawCartData = await cartModel.find({ userId: currentUser }).populate("productId").sort({ createdAt: -1 });
    
    // Filter out items where referenced product was deleted
    const cartdata = rawCartData.filter(item => item.productId != null);

    res.status(200).json({
      data: cartdata,
      count: cartdata.length,
      message: "Cart Product List",
      error: false,
      success: true
    });
    
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = CountCartProductController;
