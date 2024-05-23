var express = require("express");
var router = express.Router();
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

router.route("/cat").get(productController.viewProductsByCat);
router.route("/search").get(productController.searchProduct);
router.route("/:id").get(productController.viewProduct);

router
  .route("/")
  .get(productController.getAllProduct)
  .post(
    authController.protect,
    authController.restrict("Admin"),
    productController.uploadProductImages,
    productController.addProduct
  );
router
  .route("/:id")
  .all( authController.protect,authController.restrict("Admin"))
  .delete(productController.deleteProduct)
  .put(productController.uploadProductImages, productController.updateProduct);

module.exports = router;
