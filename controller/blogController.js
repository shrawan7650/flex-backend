const Blog = require("../model/blogModel/blogModel");



//get blog all

exports.getAllBlogController = async (req, res) => {
  try {
    const blogs = await Blog.find({});

    res.send({
      message: "Blogs fetched successfully",
      data: blogs,
      status: true,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message,
      status: false,
    });
  }
};
//getbyId bloga data

exports.getBlogByIdController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
        status: false,
      });
    }

    res.send({
      message: "Blog fetched successfully",
      data: blog,
      status: true,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message,
      status: false,
    });
  }
};