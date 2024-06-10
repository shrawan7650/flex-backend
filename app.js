const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const route = require("./routes/user/userRoutes");
const cookieParser = require("cookie-parser");
//use middlewear
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust the origin to your frontend URL

    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);

//routes all
app.use("/api/users", route);

module.exports = app;
