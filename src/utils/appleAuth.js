import AppleAuth from "apple-auth";
import fs from "fs";
const ENV = require("../env");

const config = {
  client_id: ENV.APPLE_SIGNIN_CLIENT_ID,
  team_id: ENV.env.APPLE_SIGNIN_TEAM_ID,
  redirect_uri: "",
  key_id: ENV.APPLE_SIGNIN_KEY_ID,
  scope: "name%20email",
};

const appleAuth = new AppleAuth(
  config,
  fs.readFileSync(`${__dirname}/../config/AuthKey.p8`).toString(),
  "text"
);

export default appleAuth;
