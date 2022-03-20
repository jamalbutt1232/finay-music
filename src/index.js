const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors')

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const commentRoute = require("./routes/comments");
const nftRoute = require("./routes/nft");
const cartRoute = require("./routes/cart");
const wishlistRoute = require("./routes/wishlist");
const otpRoute = require("./routes/otp");

const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const calendarRoute = require("./routes/calendar");
const notificationRoute = require("./routes/notification");

// For documentation
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const ENV = require("./env");
console.log("MONGO : ", ENV.MONGO_URL);

// mongoose.connect(
//   `mongodb+srv://abhifinay:Whatisthemeaning@finayapp.dieg5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
//   { useNewUrlParser: true },
//   function (err) {
//     if (err) console.log("err  :", err);
//   }
// );
mongoose.connect(`${ENV.MONGO_URL}`, { useNewUrlParser: true }, (doc, err) => {
  console.log("Connected to Mongo");
});

// Middleware
app.use(cors())
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
////
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finay Music",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.js"], // files containing annotations as above
};

const swaggerDocument = swaggerJsDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/comments", commentRoute);
app.use("/api/nft", nftRoute);
app.use("/api/cart", cartRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/otp", otpRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/notification", notificationRoute);

app.get("/test", (req, res) => {
  res.json("tester");
});
app.get("/", (req, res) => {
  res.json("hi");
});

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
const PORT = ENV.PORT || 8800;
const server = app.listen(PORT, () => {
  console.log("Backend server started");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  // cors: {
  //   origin: "http://localhost:3000",
  //   // credentials: true,
  // },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id); //Global room for our app users
    socket.emit("connected");
  });

  // socket.on("join chat", (room) => {
  //   socket.join(room);
  //   console.log("User Joined Room: " + room);
  // });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("create convo", (conversation) => {});

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved;
    //console.log("socket.id",socket);

    console.log("SENDING MESSAGE");
    socket.in(chat.reciever).emit("message recieved", newMessageRecieved);
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
