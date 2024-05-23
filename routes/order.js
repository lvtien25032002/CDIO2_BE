var express = require("express");
var router = express.Router();
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

router.use(authController.protect);
router.post("/", authController.restrict("User"), orderController.createOrder);
router.get(
  "/user/:userId",
  authController.restrict("User"),
  orderController.getOrdersByUserId
);
router.get(
  "/:id",
  authController.restrict("User", "Admin"),
  orderController.viewOrder
);
router.get(
  "/",
  authController.restrict("Admin"),
  orderController.getOrdersInStore
);

module.exports = router;
