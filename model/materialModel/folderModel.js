const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logos: {
    type: String,
   
  },
  pdfs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pdf' }]
});

const Folder = mongoose.model('Folder', folderSchema);
module.exports = Folder;
