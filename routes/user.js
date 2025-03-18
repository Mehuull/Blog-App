const { Router } = require("express");
const router = Router();
const User = require("../models/user");

router.get("/signin", (req, res) => {
  return res.render("signin",{ loginerror: null });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { errorMessage: null });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
  
    return res.cookie('token',token).redirect("/");

  } catch (err) {
    console.error("Login error:", err.message);
    
    return res.render("signin",{
      loginerror:"Incorrect email or password",
    });
  }
  
});

router.get('/logout',(req,res)=>{
  res.clearCookie("token").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body; 

  try {
    await User.create({
      fullname, 
      email,
      password,
    });
    return res.redirect("/");
  } catch (err) {
    console.error("Error saving user to database:", err);

    if (err.code === 11000) {
      return res.render("signup", {
        errorMessage: "Email is already registered. Please use a different email.",
      });
    }

    return res.render("signup", {
      errorMessage: "An unexpected error occurred. Please try again later.",
    });
  }
});

module.exports = router;
