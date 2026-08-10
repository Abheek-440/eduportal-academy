const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const http = require("http");
const {Server} = require("socket.io");
const sockethandeler = require("./socket/socket");
const dns = require("dns");

dotenv.config();
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // Allow requests during production setup
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/liveclasses",require("./routes/liveClassroutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/chatbot", require("./routes/chatboatRoutes"));
app.use("/api/ats", require("./routes/atsRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/notebook", require("./routes/notebookLmRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));


const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin: "*",
    credentials: true,
  },
});
sockethandeler(io);

app.get("/", (req, res) => {
  res.send("API running...");
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});