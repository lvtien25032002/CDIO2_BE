var express = require("express");
var router = express.Router();
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");
router
  .route("/")
  .get(categoryController.getAllCategory)
  .post(
    authController.protect,
    authController.restrict("Admin"),
    categoryController.updatePhoto,
    categoryController.addCategory
  );

module.exports = router;
