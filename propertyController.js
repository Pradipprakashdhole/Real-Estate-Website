const Property = require("../models/Property");
const multer = require("multer");
const path = require("path");

//  Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/images"), // Correct folder
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage }).single("image");

//  GET: Add Property Page
exports.addPropertyPage = (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("add-property"); //  corrected lowercase filename
};

//  POST: Add Property
exports.addProperty = (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.send("Upload error");

    const { title, description, location, price, type } = req.body;

    //  Correct the image path to include images/
    const imagePath = req.file ? `/images/${req.file.filename}` : "";

    try {
      const property = new Property({
        title,
        description,
        location,
        price,
        type: type.toLowerCase(), //  normalize "Buy" → "buy"
        image: imagePath,          //  use full path
        postedBy: req.session.user._id,

      });

      await property.save();
      res.redirect("/dashboard");
    } catch (err) {
      res.send("Property save error: " + err);
    }
  });
};

// GET: Buy Listings
//  GET: Buy Listings with filters
exports.buyProperties = async (req, res) => {
  const filters = { type: "buy" };

  //  Optional location filter (case-insensitive)
  if (req.query.location) {
    filters.location = { $regex: new RegExp(req.query.location, "i") };
  }

  //  Optional price filter
  if (req.query.price) {
    const [min, max] = req.query.price.split("-").map(Number);
    filters.price = { $gte: min, $lte: max };
  }

  try {
    const properties = await Property.find(filters);
    res.render("buy", { properties });
  } catch (err) {
    res.send("Error fetching buy properties: " + err);
  }
};

// GET: Rent Listings
exports.rentProperties = async (req, res) => {
  const filters = { type: "rent" };

  if (req.query.location) {
    filters.location = { $regex: new RegExp(req.query.location, "i") };
  }

  if (req.query.price) {
    const [min, max] = req.query.price.split("-").map(Number);
    filters.price = { $gte: min, $lte: max };
  }

  try {
    const properties = await Property.find(filters);
    res.render("rent", { properties });
  } catch (err) {
    res.send("Error fetching rent properties: " + err);
  }
};

exports.deleteProperty = async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    await Property.deleteOne({ _id: req.params.id, postedBy: req.session.user._id });
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Error deleting property");
  }
};

exports.editPropertyPage = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      postedBy: req.session.user._id,
    });

    if (!property) return res.status(404).send("Property not found");

    res.render("edit-property", { property });
  } catch (err) {
    res.status(500).send("Error loading edit page");
  }
};

exports.editProperty = (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.send("Upload error");

    const { title, description, location, price, type } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    try {
      const updateData = {
        title,
        description,
        location,
        price,
        type: type.toLowerCase(),
      };

      if (image) updateData.image = image;

      await Property.updateOne(
        { _id: req.params.id, postedBy: req.session.user._id },
        updateData
      );

      res.redirect("/dashboard");
    } catch (err) {
      res.status(500).send("Error updating property");
    }
  });
};

