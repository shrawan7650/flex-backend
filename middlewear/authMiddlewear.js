const jwt = require("jsonwebtoken");

exports.varifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization || req.cookies.token;
    console.log("token hai kya bhai",token)
    if (!token) {
      return res.redirect('/login');
    }

    const decoded =  jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error.name)
    if (error.name === "TokenExpiredError") {
      // Send a response that the frontend can handle for redirection
      res.clearCookie('token');     
      res.status(401).json({
        message: "token expired",
        error: error.message,
        redirect:"/login"
      });
     
    }

    res.status(401).json({
      message: "Invalid Token",
      error: error.message,
    });
  }
};

