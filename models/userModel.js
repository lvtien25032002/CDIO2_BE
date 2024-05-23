const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new Schema(
  {
    photo: {
      type: String,
      default: process.env.DEFAULT_AVATAR,
    },
    role: {
      type: String,
      trim: true,
      enum: ["User", "Admin"],
      default: "User",
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Email là bắt buộc"],
      validate: {
        validator: (value) => {
          return /^([\w-.]{3,})+@([\w-.]{3,15})+.([a-zA-Z]{2,3})$/.test(value);
        },
        message: (problem) => `${problem.value} không hợp lệ`,
      },
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "Tên là bắt buộc"],
      validate: {
        validator: (value) => {
          return /^[\p{L}\s'-.]{2,50}$/u.test(value);
        },
        message: (problem) => `${problem.value} không hợp lệ`,
      },
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Họ là bắt buộc"],
      validate: {
        validator: (value) => {
          return /^[\p{L}\s'-.]{2,50}$/u.test(value);
        },
        message: (problem) => `${problem.value} không hợp lệ`,
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Mật khẩu là bắt buộc"],
      minLength: 7,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Vui lòng xác nhận mật khẩu"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function(el) {
          return el === this.password;
        },
        message: "Mật khẩu không trùng khớp!",
      },
    },
    contact: [
      {
        phoneNumber: {
          type: String,
          trim: true,
          validate: {
            validator: (value) => {
              return /^[0-9]{10}$/.test(value);
            },
            message: (problem) => `${problem.value} không hợp lệ`,
          },
          required: [true, "Số điện thoại là bắt buộc"],
        },
        address: {
          type: String,
          trim: true,
          required: [true, "Địa chỉ là bắt buộc"],
        },
      },
    ],

    defaultContact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
    },
    signUpToken: {
      type: String,
    },
    signUpExpires: {
      type: Date,
      default: Date.now,
      index: {
        expireAfterSeconds: 10,
        partialFilterExpression: { isVerified: false },
      },
      select: false,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isCorrectPassword = async function(
  userPassword,
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createSignUpToken = function() {
  const resetToken = Math.floor(100000 + Math.random() * 900000);

  const resetTokenHex = crypto
    .createHash("sha256")
    .update(resetToken.toString())
    .digest("hex");

  this.signUpToken = resetTokenHex;

  this.signUpExpires = new Date(Date.now() + 30 * 1000 * 1000);
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
