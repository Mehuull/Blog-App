const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieparser = require("cookie-parser");

const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require("./routes/blog");

const { CheckForAuthenticationCookie } = require('./middlewares/authentication');

const app = express();
const PORT = 8000;

mongoose
  .connect('mongodb://localhost:27017/blogify')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err)); 

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views')); 

app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use(CheckForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public'))); // Serves /public as root
app.use('/images', express.static(path.join(__dirname, 'public/images'))); // Serves /images correctly

app.use((req, res, next) => {
  res.locals.user = req.user || null; 
  next();
});

app.get('/', async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs, 
  }); 
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, () => { 
  console.log(`Server started on port ${PORT}`); 
});
