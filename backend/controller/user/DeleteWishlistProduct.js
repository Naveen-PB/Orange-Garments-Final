const wishListModel = require("../../model/WishList");

const DeleteWishlistProductController = async (req, res) => {
  try {
    const currentUser = req?.userId;
    const wishlistId = req?.body?.wishlistId || req?.body?._id;

    if (!wishlistId) {
      return res.status(400).json({
        message: "Wishlist item ID is required",
        error: true,
        success: false,
      });
    }

    const deletedProduct = await wishListModel.findOneAndDelete({
      _id: wishlistId,
      userId: currentUser
    });

    res.status(200).json({
      data: deletedProduct,
      message: "Removed from wishlist",
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

module.exports = DeleteWishlistProductController;
