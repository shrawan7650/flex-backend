const mongoose = require("mongoose");
require("dotenv").config();

const conection_url = process.env.DATABASE_URL;
const maxRetries = 5; // Maximum number of retries
let retries = 0; // Current number of retries

const connectDB = async () => {
  while (retries < maxRetries) {
    try {
      await mongoose.connect(conection_url);
      console.log("MongoDB connected...");
      return; // Exit the loop once connected
    } catch (err) {
      retries += 1;
      console.log(`MongoDB connection failed (attempt ${retries}):`, err);
      if (retries >= maxRetries) {
        console.log("Max retries reached. Exiting...");
        process.exit(1);
      }
      // Exponential backoff: delay increases with each retry
      const delay = Math.pow(2, retries) * 1000; // 1, 2, 4, 8, 16 seconds
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
