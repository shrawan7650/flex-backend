const { default: mongoose } = require("mongoose");
const Folder = require("../model/materialModel/folderModel");
const Pdf = require("../model/materialModel/pdfModel");



exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find().populate('pdfs');
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getPdfsByFolderId = async (req, res) => {
  try {
    const { folderId } = req.params;

    // Check if folderId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ message: 'Invalid folderId' });
    }

    const folder = await Folder.findById(folderId).populate('pdfs');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.status(200).json(folder.pdfs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) ||!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: 'Invalid folder or moduleId' });
    }
    console.log("id",id);
    
    const folder = await Folder.findById(id).populate('pdfs');
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
console.log("folder",folder)
    const module = folder.pdfs.find((mod) => mod._id.toString() === moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};