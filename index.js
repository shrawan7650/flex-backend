require("dotenv").config();

const port = process.env.PORT || 4000;

// //database import
const databaseConnection = require("./config/databaseConnection");
//app import
const app = require("./app");

//call databaseconnection to connect the database and server running
databaseConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening on port ${port}!`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
