const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const userRoute = require("./routes/user/userRoutes");
const projectRoute =  require("./routes/project/allProject")
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
app.use("/api/users", userRoute);

app.use("/api/projects", projectRoute);

module.exports = app;
