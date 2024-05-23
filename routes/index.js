const orderControler = require("../controllers/orderController");
const userRoute = require("./user");
const authRoute = require("./auth");
const productRoute = require("./product");
const categoryRoute = require("./category");
const orderRoute = require("./order");

const globalErrorHandler = require("../controllers/errorController");
const appError = require("../utils/appError");
function route(app) {
  app.use("/api/auth", authRoute);
  app.use("/api/user", userRoute);
  app.use("/api/product", productRoute);
  app.use("/api/category", categoryRoute);
  // app.use("/api/rating", ratingRoute);
  app.use("/api/order", orderRoute);
  app.use("/", (req, res, next) => {
    res.status(200).json({ message: "Welcome to homepage" });
  });
  app.all("/*", (req, res, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
  app.use(globalErrorHandler);
}
module.exports = route;
