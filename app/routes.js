const auth_routes = require("../app/routes/auth_routes");
const user_routes = require("../app/routes/user_routes");
const declare_routes = (app) => {
  app.use("/", auth_routes);
  app.use("/", user_routes);
};

module.exports = declare_routes;
