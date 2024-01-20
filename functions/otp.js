const TWILIO_SERVICE_ID = "VA79ff724cfe2439f7214e2996510ffc1e"; //from the services->verify page
const TWILIO_ACCOUNT_ID = "AC325d5f017889346f6a6f714063ff4f75"; // account settings
const TWILIO_AUTH_TOKEN = "5e98b0f9623f7add886fc83d3f0cc213"; // account settings below

const client = require("twilio")(TWILIO_ACCOUNT_ID, TWILIO_AUTH_TOKEN);

const sendLoginOtp = (userphone) => {
  if (!userphone)
    return {
      succes: false,
      error: "Phone Number Missing",
    };

  client.verify
    .services(TWILIO_SERVICE_ID)
    .verifications.create({
      to: userphone,
      channel: "sms",
    })
    .then((verification) => {
      return {
        success: true,
        status: verification.status,
      };
    })
    .catch((err) => {
      console.log(err);
      if (err.code === 60200)
        return {
          success: false,
          error: "Invalid Parameter",
        };
      else if (err.code === 60203)
        return {
          success: false,
          error: "Max Send attempts reached",
        };
      else if (err.code === 60212)
        return {
          success: false,
          error: "Too many concurrent requests for phone number",
        };
      else
        return {
          success: false,
          error: "Server Issue, Try Again Later!",
        };
    });
};

module.exports = { sendLoginOtp };
