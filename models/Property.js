const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  price: Number,
  type: String, // Buy or Rent
  category: String,
  image: String,
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
});





module.exports = mongoose.models.Property || mongoose.model("Property", propertySchema);

