const express = require('express');

const {  getAllBlogController, getBlogByIdController } = require('../../controller/blogController');
const router = express.Router();




//get all blogs

router.get('/getblogs',getAllBlogController);

//get single blog

router.get('/getblog/:id', getBlogByIdController);



//update blog



module.exports = router;

