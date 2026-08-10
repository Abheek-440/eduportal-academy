const Message = require("../models/Message");
const users = {}; // userId -> socketId mapping

const sockethandeler = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (userId) => {
      if (userId) {
        users[userId] = socket.id;
        socket.userId = userId;
        console.log(`User ${userId} registered with socket ${socket.id}`);
        // Broadcast online user list to all connected clients
        io.emit("onlineUsers", Object.keys(users));
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = users[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = users[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { senderId });
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, senderName, senderRole, receiverId, message } = data;
        if (!senderId || !receiverId || !message) return;

        const savedMsg = await Message.create({
          senderId,
          senderName,
          senderRole,
          receiverId,
          message,
        });

        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", savedMsg);
        }

        socket.emit("receiveMessage", savedMsg);
      } catch (err) {
        console.error("Socket sendMessage error:", err);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        delete users[socket.userId];
        console.log(`User ${socket.userId} disconnected`);
        io.emit("onlineUsers", Object.keys(users));
      }
    });
  });
};

module.exports = sockethandeler;