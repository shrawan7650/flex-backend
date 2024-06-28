const mongoose = require("mongoose");

const bioSchema = new mongoose.Schema(
  {
  
    userBio: {
      type: String,
      default: null,
    },

    userExperience: {
      type: Number,
      default: null,
    },

    languages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Bio = mongoose.model("Bio", bioSchema);

module.exports = Bio;
