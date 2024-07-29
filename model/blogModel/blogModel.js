const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      default: null,
    },
    logo: {
      type: String, // Changed to String to store URL
      default: null,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
