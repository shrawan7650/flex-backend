const jwt = require("jsonwebtoken");
exports.varifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
    // console.log("token",token)
    const decode = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    req.userId = decode.id;
    next();
  } catch (error) {
    res.send({
      status: false,
      message: "Invalid Token",
      msg: error.message,
    });
  }
};
