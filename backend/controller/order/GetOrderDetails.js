const orderModel = require("../../model/OrderProductModel");

const GetOderDetails = async (req, res) => {
  try {
    const userId = req?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Please login to view orders",
        error: true,
        success: false,
      });
    }

    const orderData = await orderModel.find({ userId: String(userId) }).sort({ createdAt: -1 });

    res.status(200).json({
      data: orderData,
      message: "Ordered Product Details",
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

module.exports = GetOderDetails;
