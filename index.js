const express = require("express");
const app = express();
app.use(express.json());
const cookies = require("cookie-parser");
app.use(cookies());
const { connectDatabase } = require("./connection/file");
const generateToken = require("./tokens/generateToken");
const verifyToken = require("./tokens/verifyToken");
const { encryptPassword, verifyPassword } = require("./functions/encryption");
const signupModel = require("./models/signup");
const { sendLoginOtp, verifyOtp } = require("./functions/otp");

// Public Api
app.get("/public", (req, res) => {
  try {
    return res.json({ success: true, message: "Hello this is public api" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Signup

app.post("/signup", async (req, res) => {
  try {
    let checkusername = await signupModel.findOne({
      username: req.body.username_,
    });
    if (checkusername) {
      return res.json({ success: true, message: "Username already exist" });
    }
    let checkemail = await signupModel.findOne({
      email: req.body.email_.toLowerCase(),
    });
    if (checkemail) {
      return res.json({ success: true, message: "Email already exist" });
    }

    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(req.body.email_)) {
      const signup = {
        username: req.body.username_,
        email: req.body.email_,
        password: await encryptPassword(req.body.password_),
        mobileno: req.body.mobileno_,
      };
      const signupdata = new signupModel(signup);
      await signupdata.save();
      return res.json({ success: true, message: "you are signed up" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "pls enter a valid emailid" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Login Api

app.post("/login", async (req, res) => {
  try {
    // const currDate = new Date();
    // const newDate = new Date(currDate.setDate(currDate.getDate() + 1));
    // console.log(newDate);
    const email_ = req.body.email_;
    const userdata = await signupModel.findOne({ email: email_ });

    if (!userdata) {
      return res
        .status(400)
        .json({ success: "false", message: "Pls signup first" });
    }
    // verifying password

    const encryptedPassword = userdata.password;
    const inputPassword = req.body.password_;

    if (verifyPassword(inputPassword, encryptedPassword)) {
      sendLoginOtp(`+91${userdata.mobileno}`);

      return res.json({ success: true, message: "OTP sent succesfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/mfauth", async (req, res) => {
  try {
    const email_ = req.body.email_;
    const userdata = await signupModel.findOne({ email: email_ });
    if (!userdata) {
      return res.json({
        success: false,
        message: "User not found ,please signup first",
      });
    }
    const inputPassword = req.body.password_;
    const otp = req.body.otp;
    const encryptedPassword = userdata.password;
    if (
      (await verifyPassword(inputPassword, encryptedPassword)) &&
      (await verifyOtp(`+91${userdata.mobileno}`, otp))
    ) {
      const token = generateToken(userdata._id);
      res.cookie("auth_tk", token);
      return res.json({ success: true, message: "Logged in successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect credentials" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Middleware Function

const testMiddlewareFunction = (req, res, next) => {
  // console.log(req.cookies.web_tk);
  if (verifyToken(req.cookies.auth_tk)) {
    const userinfo = verifyToken(req.cookies.web_tk);
    console.log("Hi this is middleware function");
    console.log(userinfo);

    next();
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Authentication Failed" });
  }
};

// View profile (Secure Api/Private Api)
app.get("/profile", testMiddlewareFunction, (req, res) => {
  try {
    // console.log(req.cookies.web_tk);
    return res.json({ success: true, message: "Hello this is profile" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Friends or followers (Secure Api/Private Api)
app.get("/friends", testMiddlewareFunction, (req, res) => {
  try {
    return res.json({ success: true, message: "hello this is your friends" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Chats  (Secure Api/Private Api)
app.get("/chats", testMiddlewareFunction, (req, res) => {
  try {
    return res.json({ success: true, message: "Hi this all are your chats" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Following  (Secure Api/Private Api)
app.get("/following", testMiddlewareFunction, (req, res) => {
  try {
    return res.json({
      success: true,
      message: "These all are  profiles you follow",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = 5000;
connectDatabase();

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
