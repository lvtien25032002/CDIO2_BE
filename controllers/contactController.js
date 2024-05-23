const Contact = require("../models/contact");
const User = require("../models/userModel");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

class contactController {
  static createContact = catchAsync(async (req, res, next) => {
    const body = req.body;
    req.body.contact = await Contact.create(body);
    req.body.defaultContact = req.body.contact.id;
    next();
  });
  static getAllContact = catchAsync(async (req, res, next) => {
    req.body.contact = await Contact.find();
    next();
  });
  static updateDefaultContact = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new appError("Người dùng không được tìm thấy", 404));
    const contact = await Contact.findById(user.defaultContact);
    if (!contact)
      return next(new appError("Không tìm thấy địa chỉ liên lạc", 404));
    contact.address = req.body.address ? req.body.address : contact.address;
    contact.phoneNumber = req.body.phoneNumber
      ? req.body.phoneNumber
      : contact.phoneNumber;
    await contact.save();
    req.body.contact = contact;
    next();
  });
  static updateContact = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId).populate("contact");
    if (!user) return next(new appError("Người dùng không được tìm thấy", 404));

    let contact = await Contact.findById(req.params.contactId);
    if (!contact)
      return next(new appError("Không tìm thấy địa chỉ liên lạc", 404));
    contact.address = req.body.address ? req.body.address : contact.address;
    contact.phoneNumber = req.body.phoneNumber
      ? req.body.phoneNumber
      : contact.phoneNumber;
    await contact.save();
    let index = user.contact.findIndex(
      (el) => el._id.toString() === req.params.contactId.toString()
    );
    user.contact[index] = contact;

    user.markModified("contact");
    await user.save({ validateBeforeSave: false });

    res.status(200).send({
      status: "success",
      data: user,
    });
  });
  static addContact = catchAsync(async (req, res, next) => {
    const body = req.body;
    req.body.contact = await Contact.create(body);
    next();
  });
  static delContact = catchAsync(async (req, res, next) => {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) next(new appError("Thông tin liên hệ không tìm thấy!", 404));
    contact.__v = undefined;
    await Contact.findByIdAndDelete(req.params.contactId);
    next();
  });
  static delAllContact = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    for (let i = 0; i < user.contact.length; i++) {
      await Contact.findByIdAndDelete(user.contact[i]._id);
    }
    next();
  });
}

module.exports = contactController;
