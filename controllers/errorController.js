const appError = require("../utils/appError");
require("dotenv").config();
const devErrors = (res, err) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
    stackTrace: err.stack,
    error: err,
  });
};
const castErrorHandler = (err) => {
  const message = `Không hợp lệ cho ${err.path}: ${err.value}.`;
  return new appError(message, 400);
};
const duplicateKeyErrorHandler = (err) => {
  const key = Object.keys(err.keyValue);
  const value = err.keyValue[key];
  const message = `Đã tồn tại giá trị ${value} cho trường ${key}. Vui lòng nhập giá trị khác!`;
  return new appError(message, 400);
};
const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `Dữ liệu đầu vào không hợp lệ: ${errors.join(". ")}`;
  return new appError(message, 400);
};
const expiredJWTHandler = () => {
  const message = `Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!`;
  return new appError(message, 400);
};
const JWTErrorHandler = () => {
  const message = `Đăng nhập không hợp lệ. Vui lòng đăng nhập lại!`;
  return new appError(message, 400);
};
const prodErrors = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau!",
    });
  }
};
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV == "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    let err = { ...error, name: error.name, message: error.message };
    if (err.name === "CastError") err = castErrorHandler(err);
    if (err.code === 11000) err = duplicateKeyErrorHandler(err);
    if (err.name === "ValidationError") err = validationErrorHandler(err);
    if (err.name === "TokenExpiredError") err = expiredJWTHandler();
    if (err.name === "JsonWebTokenError") err = JWTErrorHandler();
    prodErrors(res, err);
  }
};
