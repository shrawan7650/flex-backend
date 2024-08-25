const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const userRoute = require("./routes/user/userRoutes");
const jobRoute = require("./routes/jobRoute/jobRoutes");
const applicantRoute = require("./routes/application/applicantRoute");
const cookieParser = require("cookie-parser");
const passport = require("passport");

//use middlewear
app.use(express.json());

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(cookieParser());
//passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Adjust the origin to your frontend URL

    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);




//routes all
app.use("/api/users", userRoute);
app.use("/api/job", jobRoute);
app.use("/api/applicant", applicantRoute);
module.exports = app;
