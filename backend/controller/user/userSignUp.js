const userModel = require('../../model/userModel');
const bcrypt = require('bcryptjs');

const userSignUpController = async (req, res) => {
  try {
    const { email, password, name, contact, profilepic } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: true, message: "Please provide email" });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: true, message: "Please provide password" });
    }
    if (!name) {
      return res.status(400).json({ success: false, error: true, message: "Please provide name" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: true, message: "User already exists with this email" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const payload = {
      name,
      email: normalizedEmail,
      contact: contact || "",
      password: hashPassword,
      profilepic: profilepic || "",
      role: "GENERAL"
    };

    const userData = new userModel(payload);
    const saveUser = await userData.save();

    res.status(201).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User Registered Successfully!"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = userSignUpController;
