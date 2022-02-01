const crypto = require("crypto");
const bcrypt = require("bcrypt");
const user_model = require("../../models/users");
const sendMail = require("../../helpers/sendMail");

const create_user = async (data) => {
  console.log("PDATA", data);
  const user_password =
    data.password === ""
      ? crypto.randomBytes(16).toString("hex")
      : data.password;
  const password_hash = await bcrypt.hash(user_password, 10);
  const existingUser = await user_model.find({ email: data.email });
  if (existingUser.length > 0) {
    return { success: false, message: "email already exists" };
  }
  const response = await user_model.create({
    ...data,
    password: password_hash,
  });

  return { success: true, message: response };
};

const read_user = async (user) => {
  const response = await user_model.find(user);
  return response;
};

const update_user = async (user, update) => {
  const existingUser = await user_model.find({
    _id: { $ne: update._id },
    email: update.email,
  });
  if (existingUser.length > 0) {
    return { success: false, message: "email already exists" };
  }
  const response = await user_model.findOneAndUpdate(user, update);
  return { success: true, message: response };
};

const delete_user = async (user) => {
  const response = await user_model.findOneAndDelete(user);
  return response;
};

module.exports = { create_user, read_user, update_user, delete_user };
