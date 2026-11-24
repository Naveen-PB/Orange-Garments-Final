const bcrypt = require('bcryptjs');
const userModel = require('../../model/userModel');
const jwt = require('jsonwebtoken');

const userSignInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: true, message: "Please enter email!" });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: true, message: "Please enter password!" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, error: true, message: "User not found with this email!" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({ success: false, error: true, message: "Incorrect password. Please try again!" });
    }

    const tokenData = {
      _id: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY || 'default_secret_key_orange_garments', { expiresIn: '7d' });

    const isProduction = process.env.NODE_ENV === 'production';
    const tokenOption = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      role: user.role,
      profilepic: user.profilepic,
    };

    res.cookie("token", token, tokenOption).status(200).json({
      message: "Sign in successful!",
      data: token,
      user: userProfile,
      success: true,
      error: false,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = userSignInController;
