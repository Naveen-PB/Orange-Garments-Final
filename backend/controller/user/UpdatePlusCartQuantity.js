const cartModel = require("../../model/Cart");

const UpdatePlusCartQuantityController = async (req, res) => {
  try {
    const currentUser = req?.userId;
    const cartItemId = req.body.productId || req.body._id;
    const quantity = req.body.quantity;

    if (!cartItemId || !quantity || quantity < 1) {
      return res.status(400).json({
        message: "Valid cart item ID and quantity >= 1 required",
        error: true,
        success: false,
      });
    }

    const updateProductQuantity = await cartModel.findOneAndUpdate(
      { _id: cartItemId, userId: currentUser },
      { $set: { quantity: Number(quantity) } },
      { new: true }
    );

    res.status(200).json({
      data: updateProductQuantity,
      message: "Quantity Updated",
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

module.exports = UpdatePlusCartQuantityController;
