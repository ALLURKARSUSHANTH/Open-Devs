const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: String,
  author: { type: String, ref: "User" },
  imgUrls: [String], 
  likes: { type: Number, default: 0 },
  comments:[
    {
      user: {type: String, ref: "User"},
      text: String,
      timeStamp : {type: Date, default: Date.now}
    }
  ],
  timeStamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
