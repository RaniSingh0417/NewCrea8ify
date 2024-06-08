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
const path = require("path");
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
    let email = req.body.email;
    let checkemail = await signupModel.findOne({
      email: email.toLowerCase(),
    });
    console.log(email.toLowerCase());
    if (checkemail) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exist" });
    }
    let checkusername = await signupModel.findOne({
      username: req.body.username.toLowerCase(),
    });
    if (checkusername) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exist" });
    }

    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(req.body.email)) {
      console.log(req.body);
      const signup = {
        email: req.body.email,
        password: await encryptPassword(req.body.password),
        username: req.body.username,
        dob: req.body.dob,
        mobileno: req.body.mobileno,
        gender: req.body.gender,
        isUnder18: req.body.isUnder18,
      };
      const signupdata = new signupModel(signup);
      await signupdata.save();
      return res.json({ success: true, message: "Signed Up Successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "pls enter a valid emailid" });
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
    const email = req.body.email;
    const userdata = await signupModel.findOne({ email: email });

    if (!userdata) {
      return res
        .status(400)
        .json({ success: "false", error: "Pls signup first" });
    }
    // verifying password

    const encryptedPassword = userdata.password;
    const inputPassword = req.body.password;
    if (await verifyPassword(inputPassword, encryptedPassword)) {
      const token = generateToken(userdata._id);
      res.cookie("auth_tk", token);
      return res.json({ success: true, message: "Logged in successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect credentials" });
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

const checkIfUserLoggedIn = (req, res, next) => {
  // console.log(req.cookies.web_tk);
  if (verifyToken(req.cookies.auth_tk)) {
    const userinfo = verifyToken(req.cookies.auth_tk);
    console.log(userinfo);
    req.userid = userinfo.id;
    console.log("Hi this is middleware function");
    console.log(userinfo);

    next();
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Authentication Failed" });
  }
};

app.get("/currentuser", checkIfUserLoggedIn, async (req, res) => {
  try {
    const userid = req.userid;
    const userdetails = await signupModel.findOne(
      { _id: userid },
      { email: 1, username: 1, dob: 1, mobileno: 1, isUnder18: 1, createdAt: 1 }
    );
    console.log(userdetails);
    if (userdetails) {
      return res.json({ success: true, data: userdetails });
    } else {
      return res.status(400).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// View profile (Secure Api/Private Api)
app.get("/profile", checkIfUserLoggedIn, (req, res) => {
  try {
    // console.log(req.cookies.web_tk);
    return res.json({ success: true, message: "Hello this is profile" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Friends or followers (Secure Api/Private Api)
app.get("/friends", checkIfUserLoggedIn, (req, res) => {
  try {
    return res.json({ success: true, message: "hello this is your friends" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Chats  (Secure Api/Private Api)
app.get("/chats", checkIfUserLoggedIn, (req, res) => {
  try {
    return res.json({ success: true, message: "Hi this all are your chats" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Following  (Secure Api/Private Api)
app.get("/following", checkIfUserLoggedIn, (req, res) => {
  try {
    return res.json({
      success: true,
      message: "These all are  profiles you follow",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/logout", checkIfUserLoggedIn, (req, res) => {
  try {
    res.clearCookie("auth_tk");
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// const PORT = 6000;
connectDatabase();
const PORT = process.env.PORT || 6000;

app.use(express.static("client/build"));
app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname + "/client/build/index.html"),
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
});
app.listen(PORT, async () => {
  await console.log(`Server is running at port ${PORT}`);
});
