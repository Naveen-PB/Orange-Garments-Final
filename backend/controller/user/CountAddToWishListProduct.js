const wishListModel = require("../../model/WishList");

const CountAddToWishListProductController = async (req, res) => {
  try {
    const currentUser = req?.userId;

    if (!currentUser) {
      return res.status(200).json({
        data: { count: 0 },
        message: "No user authenticated",
        error: false,
        success: true
      });
    }

    const wishListProductCount = await wishListModel.countDocuments({
      userId: currentUser
    });

    res.status(200).json({
      data: {
        count: wishListProductCount
      },
      message: "Wishlist count",
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

module.exports = CountAddToWishListProductController;
