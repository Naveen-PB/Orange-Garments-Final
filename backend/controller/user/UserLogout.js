const UserLogout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const tokenOption = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
    };
    res.clearCookie("token", tokenOption);

    res.status(200).json({
      data: [],
      message: "Logged out successfully!",
      error: false,
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = UserLogout;
