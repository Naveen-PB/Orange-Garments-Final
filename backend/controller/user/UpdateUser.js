const userModel = require("../../model/userModel");
const bcrypt = require('bcryptjs');

const Updateuser = async (req, res) => {
  try {
    const userId = req?.userId;
    const { email, password, name, contact, profilepic } = req.body;

    const payload = {};
    if (name) payload.name = name;
    if (email) payload.email = email.toLowerCase().trim();
    if (contact !== undefined) payload.contact = contact;
    if (profilepic !== undefined) payload.profilepic = profilepic;

    if (password && password.trim().length > 0) {
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(password, salt);
    }

    const options = { new: true, runValidators: true };
    const result = await userModel.findByIdAndUpdate(userId, payload, options).select("-password");

    res.status(200).json({
      data: result,
      message: "Profile updated successfully!",
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

module.exports = Updateuser;
