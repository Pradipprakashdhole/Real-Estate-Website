const ensureAuth = require("../middleware/auth");

router.get("/add-property", ensureAuth, (req, res) => {
  res.render("add-property");
});

router.post("/add-property", ensureAuth, async (req, res) => {
const { title, description, location, price, type, category } = req.body; 

  try {
    const property = new Property({
      title,
      description,
      location,
      price,
      type,
      category,
      image,
      user: req.session.user._id
    });
    await property.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding property");
  }
});

const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

// Delete
router.post("/delete/:id", propertyController.deleteProperty);

module.exports = router;
