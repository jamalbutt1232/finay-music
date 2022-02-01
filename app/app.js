const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
app.use(bodyParser.json());
const sendMail = require("./helpers/sendMail");
app.use(express.static(`public`));
app.use(cors());
app.options("*", cors());
mongoose.connection.on("open", (ref) => {
  console.log("Connected to database 🦾");
});
mongoose.connection.on("error", (err) => {
  console.log("Database connection error", err);
});

let DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tsskp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Routes
const app_routes = require("./routes.js")(app);

app.listen(3002, () => {
  console.log("Server Running at port 3002 🚀");
});
