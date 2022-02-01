const jwt = require("jsonwebtoken");
const dataCheck = require("./dataCheck");
const authenticateToken = (roles) => {
  return (req, res, next) => {
    const schemaCheck = dataCheck(req.url, req.body);
    if (!schemaCheck)
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized request" });
    if (roles === "all") {
      next();
      return;
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized request" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err)
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized request" });
      if (!roles.includes(user?.type)) {
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized request" });
      }
      req.user = user;
      next();
    });
  };
};

module.exports = authenticateToken;
