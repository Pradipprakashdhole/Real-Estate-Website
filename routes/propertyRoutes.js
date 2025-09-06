
const express = require("express");
const router = express.Router(); //  This was missing
const propertyController = require("../controllers/propertyController");

router.get("/edit-property/:id", propertyController.editPropertyPage);
router.post("/edit-property/:id", propertyController.editProperty);







module.exports = router;
