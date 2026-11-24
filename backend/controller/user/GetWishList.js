const wishListModel = require("../../model/WishList");

const GetWishListController = async (req, res) => {
  try {
    const currentUser = req?.userId;

    if (!currentUser) {
      return res.status(200).json({
        data: [],
        message: "No user authenticated",
        error: false,
        success: true
      });
    }

    const rawWishlist = await wishListModel.find({ userId: currentUser }).populate("productId").sort({ createdAt: -1 });
    
    // Filter out items where referenced product was deleted
    const wishListdata = rawWishlist.filter(item => item.productId != null);

    res.status(200).json({
      data: wishListdata,
      count: wishListdata.length,
      message: "Wishlist Product List",
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

module.exports = GetWishListController;
