const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const contactSchema = new Schema({
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        return /^[0-9]{10}$/.test(value);
      },
      message: (problem) => `${problem.value} không hợp lệ`,
    },
  },
  address: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
