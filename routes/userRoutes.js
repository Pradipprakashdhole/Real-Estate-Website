const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // Required line

router.get("/profile", userController.profilePage);
router.post("/update-profile", userController.updateProfile); // If you have profile update

const ensureAuth = require("../middleware/auth");
router.post(
  "/favorite/:id",
  ensureAuth,                   // only logged‑in users
  userController.addToFavorites
);

// View your favorites list
router.get(
  "/favorites",
  ensureAuth,
  userController.favoritesPage
); 

// Remove from favorites
router.post(
  "/favorites/remove/:id",
  ensureAuth,
  userController.removeFromFavorites
);

module.exports = router;
