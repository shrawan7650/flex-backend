const jwt = require("jsonwebtoken");
const User = require("../model/userModel/userSchema.models");

exports.authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization || req.cookies.token;
    console.log("token hai kya bhai", token);
    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error.name);
    if (error.name === "TokenExpiredError") {
      // Send a response that the frontend can handle for redirection
      res.clearCookie("token");
      res.status(401).json({
        message: "token expired",
        error: error.message,
        redirect: "/login",
      });
    }

    res.status(401).json({
      message: "Invalid Token",
      error: error.message,
    });
  }
};

exports.adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId; // Assuming req.userId is set by the authentication middleware
    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    console.error("Error in adminMiddleware:", error); // Log the error
    res.status(500).json({ msg: "Server error" });
  }
};
