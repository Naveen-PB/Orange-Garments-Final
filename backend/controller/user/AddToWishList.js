const wishListModel = require("../../model/WishList");

const wishListController = async (req, res) => {
  try {
    const { productId } = req?.body;
    const currentUser = req?.userId;

    if (!currentUser) {
      return res.status(401).json({
        message: "Please login to add to wishlist",
        error: true,
        success: false
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false
      });
    }

    const isProdAvailable = await wishListModel.findOne({ productId, userId: currentUser });
    if (isProdAvailable) {
      return res.status(400).json({
        message: "Product already exists in your wishlist",
        error: true,
        success: false
      });
    }

    const payload = {
      productId: productId,
      userId: currentUser
    };

    const newWishlistProduct = new wishListModel(payload);
    const saveProduct = await newWishlistProduct.save();

    res.status(200).json({
      data: saveProduct,
      message: "Added to Wishlist",
      error: false,
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

module.exports = wishListController;
