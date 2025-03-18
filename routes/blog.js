const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comments");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});


router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('createdBy', 'fullname profileImage');
    const comments = await Comment.find({blogId: req.params.id }).populate("createdBy",'fullname profileImage');

    if (!blog) {
      return res.status(404).send('Blog not found');
    }
    return res.render('blog', {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    console.error('Error fetching blog:', error.message);
    return res.status(500).send('An error occurred');
  }
});


router.post('/comment/:blogId', async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id, 
  });

  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  try {
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id, // Assuming `req.user` is populated via authentication middleware
      coverImageURL: `/uploads/${req.file.filename}`, // Use the uploaded file path
    });

    return res.redirect(`/blog/${blog._id}`); // Redirect to the blog detail page
  } catch (error) {
    console.error("Error creating blog:", error.message);
    return res.status(500).send("An error occurred while creating the blog.");
  }
});

module.exports = router;
