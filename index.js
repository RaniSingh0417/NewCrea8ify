const express = require("express");
const app = express();
app.use(express.json());
const cookies = require("cookie-parser");
app.use(cookies());
const { connectDatabase } = require("./connection/file");
const generateToken = require("./tokens/generateToken");
const verifyToken = require("./tokens/verifyToken");

// Public Api
app.get("/public", (req, res) => {
  try {
    return res.json({ success: true, message: "Hello this is public api" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Login Api
app.post("/login", (req, res) => {
  try {
    // const currDate = new Date();
    // const newDate = new Date(currDate.setDate(currDate.getDate() + 1));
    // console.log(newDate);
    const userid = req.body.userid;
    if ((req.body.password = "database password")) {
      const token = generateToken(userid);
      console.log(token);
      res.cookie("web_tk", token); //setting cookie
      return res.json({ success: true, message: "Hello cookie generated" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Middleware Function

const testMiddlewareFunction = (req, res, next) => {
  // console.log(req.cookies.web_tk);
  if (verifyToken(req.cookies.web_tk)) {
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
