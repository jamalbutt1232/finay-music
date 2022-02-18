const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");

dotenv.config();

mongoose.connect(`${process.env.MONGO_URL}`, { useNewUrlParser: true }, () => {
  console.log("Connected to Mongo");
});
// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

////////////////////////////////////////

// const conn = mongoose.createConnection(
//   `${process.env.MONGO_URL}`
// );
///////////////////////////
// conn.once("open", () => {
// gfs = Grid(conn.db,mongoose.mong);
// });

/////////////////////////////////////////////////////////////////////

app.listen(8800, () => {
  console.log("Backend server started");
});
