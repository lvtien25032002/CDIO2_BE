const catchAsync = require("../utils/catchAsync");
const handleController = require("./handleController");
const Category = require("../models/category");
const fileUploader = require("../utils/uploadImage");
class categoryController {
  getAllCategory = handleController.getAll(Category);
  addCategory = catchAsync(async (req, res, next) => {
    const body = { catName: req.body.catName,photo:req.file.path };
    const doc = await Category.create(body);
    res.status(200).json({
      data: doc,
    });
    
  });
  updatePhoto = fileUploader.single("photo");
}

module.exports = new categoryController();
