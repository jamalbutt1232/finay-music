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
const otpRoute = require("./routes/otp");

const AWS = require("aws-sdk");
const multer = require("multer");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

mongoose.connect(
  `mongodb+srv://admin123:admin123@cluster0.npo42.mongodb.net/Cluster0?retryWrites=true&w=majority`,
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
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/comments", commentRoute);
app.use("/api/otp", otpRoute);

// Notification API
const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};
app.post("/api/firebase/notification", (req, res) => {
  const registrationToken = req.body.registrationToken;
  const message = req.body.message;
  const options = notification_options;

  admin
    .messaging()
    .sendToDevice(registrationToken, message, options)
    .then((response) => {
      res.status(200).send("Notification sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
});

////////////////////////////////////////

AWS_ID = "AKIA2RROVPBDGISDLEY7";
AWS_SECRET = "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";
AWS_BUCKET_NAME = "finay-music-bucket";
const s3 = new AWS.S3({
  accessKeyId: AWS_ID,
  secretAccessKey: AWS_SECRET,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("image");

app.post("/upload", upload, (req, res) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `${uuidv4()}.${fileType}`,
    Body: req.file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }

    res.status(200).send(data);
  });
});

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
