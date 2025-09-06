const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "realestate_secret",
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

mongoose.connect("mongodb://localhost:27017/realestate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error", err));

const routes = require("./routes/index");
app.use("/", routes);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/buy", (req, res) => {
  res.render("buy");
});

app.get("/rent", (req, res) => {
  res.render("rent");
});

////add-property/////
const multer = require("multer");
// adjust if needed

// Storage for image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// GET form
app.get("/add-property", (req, res) => {
  res.render("add-property");
});

// POST form
app.post("/add-property", upload.single("image"), async (req, res) => {
  try {
    const { title, price, location, type, description } = req.body;
    const newProperty = new Property({
      title,
      price,
      location,
      type,
      description,
      image: req.file.filename,
      user: req.session.user._id
    });
    await newProperty.save();
    res.redirect(type === "buy" ? "/buy" : "/rent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error posting property.");
  }
});

const Property = require('./models/Property'); // make sure this path is correct
/*
app.get("/property/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).send("Property not found");
    res.render("property-details", { property });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});




const User = require('./models/User'); // Make sure the path is correct

app.get("/owner/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("Owner not found");
    res.render("owner-details", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
*/


/*app.get("/property/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("user");

    if (!property) return res.status(404).send("Property not found");

    console.log("Populated Property:", property); // 🐞 Debug log
    res.render("property-details", { property });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

*/

// Example route: /property/:id
app.get('/property/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('postedBy'); 
    res.render('property-details', { property });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

const User = require('./models/User'); 

app.get('/owner/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('Owner not found');
    }
    res.render('owner-details', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


const ownerRoutes = require('./routes/ownerRoutes');
app.use('/', ownerRoutes); // Now your /owner/:id route will work


const authRoutes = require('./routes/auth');
app.use(authRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use(dashboardRoutes);

const indexRoutes = require("./routes/index"); //  Correct path

app.use("/", indexRoutes); // Hook up routes

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const flash = require("connect-flash");

app.use(session({
  secret: "realestate_secret",
  resave: false,
  saveUninitialized: false
}));

app.use(flash()); // Must come **after** session

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

const userRoutes = require("./routes/userRoutes");
app.use(userRoutes); //  Don’t forget this

const propertyRoutes = require("./routes/propertyRoutes");
app.use(propertyRoutes); // Register the routes

const favoriteRoutes = require("./routes/favoriteRoutes");
app.use(favoriteRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
