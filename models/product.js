const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema(
  {
    category: {
      catName: {
        type: String,
        required: [true, "Tên danh mục là bắt buộc"],
      },
    },
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      validate: {
        validator: function(v) {
          return /^(?=.*[\p{L}])[\p{L}\d\s'-.]{6,50}$/u.test(v);
        },
        message: (props) => `${props.value} không hợp lệ`,
      },
    },
    images: [
      {
        type: String,
        required: [true, "Hình ảnh là bắt buộc"],
      },
    ],
    price: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: function(v) {
          return v >= 0 && Number.isInteger(v);
        },
        message: (props) => `${props.value} không hợp lệ.`,
      },
    },
    ratingAverage: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      maxLength: [200, "Mô tả chỉ được tối da 200 kí tự"],
    },
    isOutofOrder: {
      type: Boolean,
      default: false,
    },
    ratingsAverage: {
      type: Number,
      default: 5.0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre(`/^find/`, function(next) {
  if (!this.isAvailable) {
    this.isAvailable = true;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
