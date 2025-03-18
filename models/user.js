const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("node:crypto");
const { createTockenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      required: true,
      default: "/images/profileimg.png", // Use /images/ as it's served by express.static
    },    
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();
  const salt = randomBytes(16).toString();
  const hashedpassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedpassword;
  next();
});

userSchema.static('matchPasswordAndGenerateToken', async function (email, password) {
  // Find the user with the provided email
  const user = await this.findOne({ email });
  if (!user) throw new Error('User not found');

  // Extract salt and hashed password from the user object
  const { salt, password: hashedPassword } = user;

  // Hash the provided password using the user's salt
  const userProvidedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  // Compare the hashed password with the stored one
  if (hashedPassword !== userProvidedPassword) {
    throw new Error('Incorrect password');
  }

  const token = createTockenForUser(user);
  return token;
});




const User = model("user", userSchema);

module.exports = User;
