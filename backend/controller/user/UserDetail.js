const userModel = require("../../model/userModel");

const userDetailController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    res.status(200).json({
      data: user,
      error: false,
      success: true,
      message: "User Details"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = userDetailController;
