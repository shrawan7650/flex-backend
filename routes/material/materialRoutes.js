const express = require('express');
const router = express.Router();

const { upload } = require('../../middlewear/multerMiddleweare');
const { StudyMaterialController, getFolders, getPdfById, getPdfsByFolderId, getModuleById } = require('../../controller/studyMaterial');

router.post('/studyMaterial', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), StudyMaterialController);
router.get('/studyMaterialfolder', getFolders); // New route for fetching folder data
router.get('/studyMaterial/:folderId/pdfs', getPdfsByFolderId); // Route for fetching PDFs by folder ID
router.get('/folders/:id/modules/:moduleId', getModuleById);
module.exports = router;
