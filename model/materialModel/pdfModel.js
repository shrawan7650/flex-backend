const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    module: [{ type: String, required: true }],
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
  },
  { timestamps: true }
);

const Pdf = mongoose.model("Pdf", pdfSchema);
module.exports = Pdf;
