const cartModel = require("../../model/Cart");

const DeleteCartProductController = async (req, res) => {
  try {
    const currentUser = req?.userId;
    const cartProductId = req?.body?.cartProductId || req?.body?._id;

    if (!cartProductId) {
      return res.status(400).json({
        message: "Cart product ID is required",
        error: true,
        success: false,
      });
    }

    const deletedProduct = await cartModel.findOneAndDelete({
      _id: cartProductId,
      userId: currentUser
    });

    res.status(200).json({
      data: deletedProduct,
      message: "Product deleted from cart",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = DeleteCartProductController;
