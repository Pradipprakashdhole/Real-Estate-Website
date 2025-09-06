const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

// Import Models
const User = require("../models/User");
const Property = require("../models/Property");

// Admin login page
router.get("/login", (req, res) => {
  res.render("admin/login");
});

// Handle login form
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Hardcoded admin (replace with DB check later)
  if (email === "admin@site.com" && password === "admin123") {
    req.session.admin = { email };
    return res.redirect("/admin/dashboard");
  }

  res.send("Invalid credentials");
});

// Admin dashboard (protected)
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    const properties = await Property.find();

    res.render("admin/dashboard", {
      admin: req.session.admin,
      users,
      properties
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Server error");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

module.exports = router;
