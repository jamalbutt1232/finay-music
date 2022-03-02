const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const AWS_ID = process.env.AWS_ID;
const AWS_SECRET = process.env.AWS_SECRET;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

module.exports = {
  PORT,
  MONGO_URL,
  TOKEN_SECRET,
  AWS_ID,
  AWS_SECRET,
  AWS_BUCKET_NAME,
};