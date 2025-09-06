const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const propertyController = require("../controllers/propertyController");

// User Routes
router.get("/", userController.home);
router.get("/login", userController.loginPage);
router.get("/signup", userController.signupPage);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/dashboard", userController.dashboard);
router.get("/logout", userController.logout);

// Property Routes
router.get("/add-property", propertyController.addPropertyPage);
router.post("/add-property", propertyController.addProperty);

router.get("/buy", propertyController.buyProperties);
router.get("/rent", propertyController.rentProperties);
router.get("/commercial", propertyController.rentProperties);
router.post("/delete-property/:id", propertyController.deleteProperty);

// routes/index.js

const Property = require("../models/propertyModel"); // Make sure this is correct

// Buy Page
router.get("/buy", async (req, res) => {
  const { location, price } = req.query;
  let filter = { type: "buy" };

  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }

  if (price) {
    const [min, max] = price.split("-");
    filter.price = { $gte: parseInt(min), $lte: parseInt(max) };
  }

  try {
    const properties = await Property.find(filter);
    res.render("buy", { properties });
  } catch (err) {
    console.error(err);
    res.send("Error loading properties");
  }
});

module.exports = router;
