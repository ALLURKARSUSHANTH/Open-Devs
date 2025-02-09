const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: String,
  author: { type: String, ref: "User" }, 
  timeStamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
