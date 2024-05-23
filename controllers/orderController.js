const Order = require("../models/order");
const Product = require("../models/product");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const moment = require("moment");
const mongoose = require("mongoose");
const ApiFeatures = require("../utils/ApiFeatures");

class orderController {
  static createOrder = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { cart, totalPrice, contact, shipCost } = req.body;

    // Verify price of product
    for (const item of cart) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new appError("Invalid product id", 404));
      }
      if (product.price !== item.price) {
        return next(new appError("Product price does not match", 500));
      }
    }

    // Calculate total price
    const productTotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const grandTotal = productTotal + shipCost;

    if (grandTotal !== totalPrice) {
      return next(appError("Total price does not match", 500));
    }

    const newOrder = await Order.create({
      user: userId,
      cart,
      totalPrice: grandTotal,
      shipCost,
      contact,
      status: "Finished",
      dateOrdered: new Date(Date.now() + process.env.UTC * 60 * 60 * 1000),
    });

    return res.status(201).json({
      status: "Success",
      data: newOrder,
    });
  });
  static getOrdersByUserId = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user) return next(new appError("Invalid user Id"), 404);
    let start, end;

    if (!req.query.start)
      start = moment()
        .subtract(30, "days")
        .add(process.env.UTC, "hours")
        .toDate();
    else
      start = moment(req.query.start, "DD-MM-YYYY")
        .add(process.env.UTC, "hours")
        .toDate();

    if (!req.query.end)
      end = moment()
        .add(process.env.UTC, "hours")
        .toDate();
    else
      end = moment(req.query.end, "DD-MM-YYYY")
        .add(31, "hours")
        .toDate(); // process.env.UTC + 24 hours
    let obj = {
      user: req.params.userId,
      dateOrdered: {
        $gte: start,
        $lt: end,
      },
    };
    if (req.query.status)
      obj = {
        ...obj,
        status: req.query.status,
      };
    const features = new ApiFeatures(Order.find(obj), req.query)
      .sort()
      .limitFields()
      .paginate();
    const orders = await features.query;
    res.status(200).json({
      status: "success",
      length: orders.length,
      data: orders,
    });
  });
  static getOrdersInStore = catchAsync(async (req, res, next) => {
    let start, end;

    if (!req.query.start)
      start = moment()
        .subtract(30, "days")
        .add(process.env.UTC, "hours")
        .toDate();
    else
      start = moment(req.query.start, "DD-MM-YYYY")
        .add(process.env.UTC, "hours")
        .toDate();

    if (!req.query.end)
      end = moment()
        .add(process.env.UTC, "hours")
        .toDate();
    else
      end = moment(req.query.end, "DD-MM-YYYY")
        .add(31, "hours")
        .toDate(); // process.env.UTC + 24 hours
    let obj = {
      dateOrdered: {
        $gte: start,
        $lt: end,
      },
    };
    if (req.query.status)
      obj = {
        ...obj,
        status: req.query.status,
      };
    const features = new ApiFeatures(Order.find(obj), req.query)
      .sort()
      .limitFields()
      .paginate();
    const orders = await features.query;
    res.status(200).json({
      status: "success",
      length: orders.length,
      data: orders,
    });
  });
  static viewOrder = catchAsync(async (req, res, next) => {
    const order = await Order.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
      },

      {
        $lookup: {
          from: "contacts",
          localField: "contact",
          foreignField: "_id",
          as: "contact",
        },
      },
      {
        $unwind: "$contact",
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$cart",
      },
      {
        $lookup: {
          from: "products",
          localField: "cart.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          "cart.product.name": "$product.name",
          "cart.product._id": "$product._id",
          "cart.product.images": "$product.images",
        },
      },
      {
        $group: {
          _id: "$_id",
          cart: { $push: "$cart" },
          shipCost: { $first: "$shipCost" },
          totalPrice: { $first: "$totalPrice" },
          status: { $first: "$status" },
          user: { $first: "$user" },
          contact: { $first: "$contact" },
          dateOrdered: { $first: "$dateOrdered" },
        },
      },
      {
        $project: {
          product: 1,
          shipCost: 1,
          totalPrice: 1,
          status: 1,
          user: {
            email: 1,
            firstName: 1,
            lastName: 1,
          },
          cart: {
            quantity: 1,
            _id: 1,
            images: 1,
            price: 1,
            name: 1,
            ratingsAverage: 1,
          },
          cart: 1,
          contact: 1,
          dateOrdered: 1,
        },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: order[0],
    });
  });
}
module.exports = orderController;
