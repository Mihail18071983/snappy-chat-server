const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
const User = require("./models/userModel");
const { ObjectId } = require("mongoose").Types;
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    // origin: "*",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  socket.on("user-online", async (userId) => {
    console.log("User online:", userId);
    if (!userId || !ObjectId.isValid(userId)) return;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      user.isOnline = true;
      await user.save();
      socket.emit("user-status-updated", { userId, isOnline: true });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("user-offline", async (userId) => {
    console.log("User offline:", userId);
    if (!userId || !ObjectId.isValid(userId)) return;
    try {
      const user = await User.findById(userId);
      if (!user) return;
      user.isOnline = false;
      await user.save();
      socket.emit("user-status-updated", { userId, isOnline: false });
    } catch (err) {
      console.log(err);
    }
  });
});
