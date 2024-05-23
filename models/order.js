const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: {
        type: Number,
        default: 1,
      },
      notes: {
        type: String,
        default: undefined,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
  shipCost: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: [
      "Pending", // when user order
      "Finished", // when shipper deliveried
    ],
    default: "Pending",
  },
  dateOrdered: {
    type: Date,
  },

  contact: {
    type: Schema.Types.ObjectId,
    ref: "Contact",
  },
});
module.exports = mongoose.model("Order", orderSchema);
