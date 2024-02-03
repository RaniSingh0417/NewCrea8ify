const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dob: {
      type: Date,
      required: true,
    },

    mobileno: {
      type: Number,
      required: true,
      trim: true,
    },
    gender: { type: String, required: true },
    isUnder18: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const signupModel = mongoose.model("signupdata", signupSchema);
module.exports = signupModel;
