const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const route = require("./routes/user/userRoutes");
// const cookiesParser = require("cookies-parser");
//use middlewear
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(morgan("dev"));
// app.use(cookiesParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);

//routes all
app.use("/api/users", route);

module.exports = app;
