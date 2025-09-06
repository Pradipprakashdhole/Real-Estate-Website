const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

// GET: Home Page
exports.home = (req, res) => {
  res.render("home", { user: req.session.user });
};

// GET: Signup Page
exports.signupPage = (req, res) => {
  res.render("signup");
};

// POST: Signup
exports.signup = async (req, res) => {
  const { name, email, password, mobile } = req.body; //  include mobile
  const hashedPass = await bcrypt.hash(password, 10);

  try {
    const user = new User({ name, email, password: hashedPass, mobile }); //  save mobile
    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.send("Error during signup: " + err);
  }
};

// GET: Login Page
exports.loginPage = (req, res) => {
  res.render("login");
};

// POST: Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Invalid password");

    req.session.user = user;
    res.redirect("/dashboard");
  } catch (err) {
    res.send("Login error: " + err);
  }
};

// GET: Dashboard
const Property = require("../models/propertyModel"); // Import your model

/// GET: Dashboard
exports.dashboard = async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    // Fetch the full user object, populating the favorites array
    const user = await User
      .findById(req.session.user._id)
      .populate("favorites");

    // Fetch properties the user has posted
    const properties = await Property.find({ postedBy: req.session.user._id });

    // Render, passing both their own listings and their favorites
    res.render("dashboard", {
      user,
      properties,
      favorites: user.favorites
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Error loading dashboard");
  }
};

// GET: Logout
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

exports.profilePage = (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.render("profile", {
    user: req.session.user,
    // should log 'function'

    success_msg: req.flash("success_msg")
  });
};

 // make sure this line is at the top

// GET: Home Page

exports.home = async (req, res) => {
  try {
    const buyProperties = await Property.find({ type: "buy" })
      .sort({ createdAt: -1 })
      .limit(6);

    const rentProperties = await Property.find({ type: "rent" })
      .sort({ createdAt: -1 })
      .limit(6);

    res.render("home", {
      user: req.session.user || null,
      buyProperties,
      rentProperties,
    });
  } catch (err) {
    console.error("Home page error:", err);
    res.status(500).send("Internal Server Error");
  }
};

//  Multer storage config for profile image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profile-images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage }).single("profileImage");

//  POST: Update profile
exports.updateProfile = (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).send("Upload error: " + err);

    const { name, mobile } = req.body;
    const profileImage = req.file ? `/profile-images/${req.file.filename}` : null;

    try {
      const updates = { name, mobile };
      if (profileImage) updates.profileImage = profileImage;

      const updatedUser = await User.findByIdAndUpdate(req.session.user._id, updates, { new: true });
      req.session.user = updatedUser;

      // Flash success message
      req.flash("success_msg", "Profile updated successfully!");
      res.redirect("/profile");
    } catch (error) {
      res.status(500).send("Error updating profile");
    }
  });
};

//  Add to Favorites
exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const propertyId = req.params.id;

    if (!userId || !propertyId) {
      return res.status(400).send("Missing user or property ID");
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: propertyId }
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error saving favorite:", err);
    res.status(500).send("Error saving favorite");
  }
};

//  View Favorites Page
exports.favoritesPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate("favorites");
    res.render("favorites", { properties: user.favorites });
  } catch (err) {
    console.error("Error loading favorites:", err);
    res.status(500).send("Error loading favorites");
  }
};

//  Remove from Favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const propertyId = req.params.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: propertyId }
    });

    res.redirect("/favorites");
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).send("Error removing favorite");
  }
};
