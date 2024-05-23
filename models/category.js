const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  catName: {
    type: String,
    required: [true, "Tên danh mục là bắt buộc"],
    unique: true,
  },
  photo: {
    type: String,
    required: [true, "Danh mục bắt buộc phải có hình ảnh"],
  },
});
categorySchema.pre(/^find/, function(next) {
  this.select("-__v");
  next();
});
module.exports = mongoose.model("Category", categorySchema);
