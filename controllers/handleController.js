const { ObjectId } = require("mongodb");
const appError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const cloudinary = require("cloudinary").v2;

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findById(id);
    console.log(doc)
    if (!doc) {
      return next(new appError("Couldn't find this document", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.find({});
    return res.status(200).json(doc);
  });

exports.postOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const created = await Model.create(req.body);
    res.status(201).json(created);
  });

exports.delOne = (Model) => async (req, res, next) => {
  try {
    const id = req.params.id;
    const doc = await Model.findById(id).select(
      "+behindImageCCCD +frontImageCCCD +licenseImage"
    );
    if (!doc) {
      return next(new appError("Couldn't find document with this id", 404));
    }

    let behindImageCCCD = filenameImage(doc?.behindImageCCCD);
    let frontImageCCCD = filenameImage(doc?.frontImageCCCD);
    let licenseImage = filenameImage(doc?.licenseImage);

    cloudinary.uploader.destroy(frontImageCCCD);
    cloudinary.uploader.destroy(behindImageCCCD);
    cloudinary.uploader.destroy(licenseImage);
    await Model.findByIdAndDelete({ _id: id });

    res.status(201).json("Delete successfully");
  } catch (error) {
    next(error);
  }
};

const filenameImage = (url) => {
  let parts = url.split("/");
  let filename = parts[parts.length - 1];
  let result = parts[parts.length - 2] + "/" + filename.split(".")[0];
  return result;
};

exports.putOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.file) {
      body = {
        ...body,
        photo: req.file.photo?.path,
      };
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new appError("No document found with that ID", 404));
    }

    res.status(200).json({
      data: doc,
    });
  });
