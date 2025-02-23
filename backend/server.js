const express = require("express");
const connectDB = require("./config");
const cors = require("cors");

require("dotenv").config();
const app = express();


app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit:'50',extended: true }));

connectDB();

app.use("/mentor", require("./routes/mentorRoutes"));
app.use("/follow", require("./routes/follow"));
app.use("/posts", require("./routes/postRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/connections", require("./routes/connection"));
app.use("/notifications", require("./routes/notification"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));