const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const commentRoute = require("./routes/comments");
const AWS = require("aws-sdk");
const multer = require("multer");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const uuid = require("uuid");

dotenv.config();

mongoose.connect(
  `${process.env.MONGO_URL}`,
  { useNewUrlParser: true },
  () => {
    console.log("Connected to Mongo");
  }
);
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ID,
//   secretAccessKey: process.env.AWS_SECRET,
// });
// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/comments", commentRoute);

////////////////////////////////////////
// // Mongo URI
// const mongoURI =
//   "mongodb+srv://admin123:admin123@cluster0.npo42.mongodb.net/Cluster0?retryWrites=true&w=majority";

// AWS_ID = "";
// AWS_SECRET = "";
// AWS_BUCKET_NAME = "";

// const storage = multer.memoryStorage({
//   destination: function (req, file, callback) {
//     callback(null, "");
//   },
// });

// const upload = multer({ storage }).single("image");

// app.post("/upload", upload, (req, res) => {
//   console.log(req.file);
//   res.send({
//     message: "filer",
//   });
//   // let myFile = req.file.originalname.split(".");
//   // const fileType = myFile[myFile.length - 1];

//   // const params = {
//   //   Bucket: process.env.AWS_BUCKET_NAME,
//   //   Key: `${uuid()}.${fileType}`,
//   //   Body: req.file.buffer,
//   // };

//   // s3.upload(params, (error, data) => {
//   //   if (error) {
//   //     res.status(500).send(error);
//   //   }

//   //   res.status(200).send(data);
//   // });
// });

/////////////////////////////////////////////////////////////////////

app.listen(8800, () => {
  console.log("Backend server started");
});
