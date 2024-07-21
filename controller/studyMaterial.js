const { default: mongoose } = require("mongoose");
const Folder = require("../model/materialModel/folderModel");
const Pdf = require("../model/materialModel/pdfModel");
const { uploadFileOnCloudinary } = require("../utils/cloudinary/cloudniary");

exports.StudyMaterialController = async (req, res) => {
  try {
    const { name } = req.body;
    const logoFile = req.files.logo[0].path;
    const pdfFile = req.files.pdf[0].path;
console.log("logoFile",logoFile);
    console.log("pdfFile",pdfFile);
    if (!name || !logoFile || !pdfFile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if folder with the same name already exists
    let folder = await Folder.findOne({ name });

    if (!folder) {
      // If folder doesn't exist, create a new one

      // Upload logo to Cloudinary
      const logoUrl = await uploadFileOnCloudinary(logoFile);
      console.log("lofgoUrl",logoUrl)


      // Upload PDF to Cloudinary
      const pdfResult = await uploadFileOnCloudinary(pdfFile);
      // const pdfResult = "http://res.cloudinary.com/dv85evelk/image/upload/v1720373573/py6tadhteoca4pa33msc.pdf";
      // const logoUrl = "http://res.cloudinary.com/dv85evelk/image/upload/v1720373572/mat3uw0krhe9e9zpbo9g.jpg";
      
      // Create a new PDF document and save it
      const pdf = new Pdf({
        url: pdfResult,
        module: ["Module 1"],
      });
      await pdf.save();

      // Create a new Folder document and save it
      folder = new Folder({
        name,
        logos: logoUrl,
        pdfs: [pdf._id]
      });
      await folder.save();

      res.status(200).json({ message: 'Folder uploaded successfully' });
    } else {
      // If folder already exists, add the new PDF to its existing array

      // Upload PDF to Cloudinary
      const pdfResult = await uploadFileOnCloudinary(pdfFile);
      // const pdfResult = "http://res.cloudinary.com/dv85evelk/image/upload/v1720373573/py6tadhteoca4pa33msc.pdf";

      // Find the existing modules and determine the new module number
      const existingPdfs = await Pdf.find({ _id: { $in: folder.pdfs } });
      const newModuleNumber = existingPdfs.length + 1;
      const newModuleName = `Module ${newModuleNumber}`;

      // Create a new PDF document and save it
      const pdf = new Pdf({
        url: pdfResult,
        module: [newModuleName],
      });
      await pdf.save();

      // Update the existing folder with the new PDF
      folder.pdfs.push(pdf._id);
      await folder.save();

      res.status(200).json({ message: 'PDF added to existing folder successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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