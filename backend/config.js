const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/open-devs', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database Connection Error", error);
    process.exit(1);
  }
};

module.exports = connectDB;