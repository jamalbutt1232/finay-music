const jwt = require("jsonwebtoken");
const usersModal = require("../../models/users");
const bcrypt = require("bcrypt");

const login = async (email, password) => {
  const password_hash = await bcrypt.hash(password, 10);
  console.log(password_hash);
  const user = await usersModal.findOne({
    email: email,
  });
  if (user) {
    const password_match = await bcrypt.compare(password, user.password);
    if (password_match) {
      if (user.status === false) {
        return { success: false, message: "account blocked" };
      }
      const user_obj = { email, type: user.type, pump: user.pump };
      const access_token = jwt.sign(user_obj, process.env.ACCESS_TOKEN_SECRET);
      return { success: true, message: access_token };
    } else {
      return { success: false, message: "invalid email or password" };
    }
  } else {
    return { success: false, message: "invalid email or password" };
  }
};

module.exports = { login };
