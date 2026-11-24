const userModel = require('../../model/userModel');

const UpdateuserRole = async (req, res) => {
  try {
    const sessionUserId = req.userId;
    const { id } = req.params;
    const { role } = req.body;

    const sessionUser = await userModel.findById(sessionUserId);
    if (sessionUser?.role !== 'ADMIN') {
      return res.status(403).json({
        message: "Permission denied! Admin access required.",
        error: true,
        success: false,
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

    res.status(200).json({
      data: updatedUser,
      message: "User role updated successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = UpdateuserRole;
