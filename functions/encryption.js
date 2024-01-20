const bcrypt = require("bcryptjs");

//this will be used when signup

const encryptPassword = async (originalPassword) => {
  try {
    const encryptedPassword = await bcrypt.hash(originalPassword, 11);
    return encryptedPassword;
  } catch (error) {
    console.log(error);
  }
};

const verifyPassword = async (inputPassword, encryptedPassword) => {
  try {
    const CheckPassword = await bcrypt.compare(
      inputPassword,
      encryptedPassword
    );
    return CheckPassword;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { encryptPassword, verifyPassword };
