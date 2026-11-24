const mongoose = require("mongoose");

const WishListSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const wishListModel = mongoose.model("wishList", WishListSchema);

module.exports = wishListModel;
