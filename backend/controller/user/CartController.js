const cartModel = require("../../model/Cart");

const CartController = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req?.body;
    const currentUser = req?.userId;

    if (!currentUser) {
      return res.status(401).json({
        message: "Please login to add products to your cart",
        error: true,
        success: false,
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    // Check if product is already in the cart
    const isProdAvailable = await cartModel.findOne({ productId, userId: currentUser });
    if (isProdAvailable) {
      isProdAvailable.quantity += (Number(quantity) || 1);
      const updated = await isProdAvailable.save();
      return res.status(200).json({
        data: updated,
        message: "Product quantity updated in cart.",
        error: false,
        success: true,
      });
    }

    const payload = {
      productId: productId,
      quantity: Number(quantity) || 1,
      userId: currentUser
    };

    const newProductToCart = new cartModel(payload);
    const saveProduct = await newProductToCart.save();

    res.status(201).json({
      data: saveProduct,
      message: "Product added to cart successfully.",
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

module.exports = CartController;
