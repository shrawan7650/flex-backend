const express = require('express');
const router = express.Router();

const { contributionRegister,proposalController, aboutContoller ,newslettlerController} = require('../../controller/projectController');
const { upload } = require('../../middlewear/multerMiddleweare');

router.post("/contribtionRegister/:email", contributionRegister);
router.post("/propsal/:email", upload.single("avatar"), proposalController);
router.post("/about",aboutContoller)
router.post("/newsletter",newslettlerController)


module.exports = router;