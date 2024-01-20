const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, trim: true },

    mobileno: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const signupModel = mongoose.model("signupdata", signupSchema);
module.exports = signupModel;
