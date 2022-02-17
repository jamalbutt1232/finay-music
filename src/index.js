const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

// mongoose.connect(
//   "mongodb+srv://admin1234:admin1234@cluster0.npo42.mongodb.net/Cluster0?retryWrites=true&w=majority",
//   { useNewUrlParser: true },
//   () => {
//     console.log("Connected to Mongo");
//   }
// );
mongoose.connect(
  "mongodb+srv://admin123:admin123@cluster0.npo42.mongodb.net/Cluster0?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  () => {
    console.log("Connected to Mongo");
  }
);
// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(8800, () => {
  console.log("Backend server started");
});
