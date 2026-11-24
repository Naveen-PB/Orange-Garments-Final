const uploadProductPermission = require("../../helpers/permission");
const productModel = require("../../model/productModel");

const DeleteProductController = async (req, res) => {
  try {
    const sessionUserId = req.userId;
    if (!(await uploadProductPermission(sessionUserId))) {
      return res.status(403).json({
        message: "Permission denied! Admin access required.",
        error: true,
        success: false,
      });
    }

    const productId = req.params?.id || req.body?._id || req.body?.productId;
    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required for deletion.",
        error: true,
        success: false,
      });
    }

    const deletedProduct = await productModel.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found or already deleted.",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      data: deletedProduct,
      message: "Product deleted successfully from database!",
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

module.exports = DeleteProductController;
