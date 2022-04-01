const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ENV = require("../env");

// GET USER ID
const getUserID = (token) => {
  console.log("GET USER ID");
  let uid = undefined;
  jwt.verify(token, ENV.TOKEN_SECRET, function (err, data) {
    uid = data._id;
  });
  return uid;
};
// Will return flag value if email code verified yet or not
const getUserFlag = async (uid) => {
  console.log("GET USER FLAG");
  const user = await User.findOne({ _id: uid });
  console.log("user  :LLLLLLLLL ", user);
  let flag = await user.isValid;
  return flag;
};
module.exports = function (req, res, next) {
  console.log("Came to checj JWT TOKEN");
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;

    const uid = getUserID(req.token, res);
    getUserFlag(uid).then((flag) => {
      console.log("flag wait: ", flag);
      if (flag) {
        console.log("GO TO NEXT");

        next();
      } else {
        console.log("NOT GOT TO NEXT");

        const result = {
          status_code: 500,
          status_msg: `Please verify your email first`,
        };
        res.status(500).json(result);
      }
    });
  } else {
    res.status(400).send("No token exist");
  }
};
