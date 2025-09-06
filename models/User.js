const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobile: { type: String }, 
  profileImage: { type: String, default: "/images/default-user.png" },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    }
  ],
  isSubscribed: { type: Boolean, default: false }, // subscription
  isAdmin: { type: Boolean, default: false },      // ✅ admin flag
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);

