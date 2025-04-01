const express = require("express");
const connectDB = require("./config");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./socket");
const connectionRoutes = require("./routes/connection"); // Import the router

require("dotenv").config();

const app = express();
const server = http.createServer(app); // Create the HTTP server

// Initialize Socket.IO
const io = initializeSocket(server);

// CORS middleware
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  credentials: true,
  allowedHeaders: "Content-Type,Authorization"
}));

// Body parsing middleware

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to the database
connectDB();


// Routes
app.use("/mentor", require("./routes/mentorRoutes"));
app.use("/follow", require("./routes/follow"));
app.use("/posts", require("./routes/postRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/connections", connectionRoutes(io));
app.use("/notifications", require("./routes/notification"));
app.use('/messages', require('./routes/chatRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Use server.listen, not app.listen