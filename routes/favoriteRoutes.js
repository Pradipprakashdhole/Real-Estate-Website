const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/favorite/:id", userController.addToFavorites);
router.get("/favorites", userController.favoritesPage);

module.exports = router;
