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

var accountSid = "AC29e6dec481584aad3c5be4cf93d0f0fa"; // Your Account SID from www.twilio.com/console
var authToken = "1a96b8b3f5e20bfe0aa1d1fab308d78d"; // Your Auth Token from www.twilio.com/console

const client = require("twilio")(accountSid, authToken, {
  lazyLoading: true,
});
// sendMessage();
let v;
function sendMessage() {
  client.messages
    .create({ body: "123451", from: "13516668982", to: "+923224948730" })
    .then((message) => {
      v = message.sid;
      console.log(" message.sid :", message.sid);
    });
}
verify();
function verify() {
  // client.verify
  //   .services(v)
  //   .verificationChecks.create({ to: "+923224948730", code: "123451" })
  //   .then((verification_check) =>
  //     console.log("verification_check.status : ", verification_check)
  //   );
  client.verify.services
    .create({ friendlyName: "My First Verify Service" })
    .then((service) => console.log(service.sid));
}
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

const server = app.listen(8800, () => {
  console.log("Backend server started");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved;
    //console.log(chat, newMessageRecieved);
    //if (!chat.users) return console.log("chat.users not defined");

    socket.in(chat.reciever).emit("message recieved", newMessageRecieved);
    // chat.users.forEach((user) => {
    //   if (user._id == newMessageRecieved.sender._id) return;

    //   socket.in(user._id).emit("message recieved", newMessageRecieved);
    // });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
