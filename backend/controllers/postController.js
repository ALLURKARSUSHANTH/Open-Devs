const Post = require('../models/Post');
const User = require('../models/User');
const axios = require('axios');
const multer = require('multer');
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

exports.uploadMiddleware = upload.array("images", 5);

exports.createPost = async (req, res) => {
  const { content, author } = req.body;
  const files = req.files;
  console.log("Received files:", req.files);
  console.log("Received content:", content);
  console.log("Received author:", author);

  try {
    let imgUrls = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const base64Image = file.buffer.toString("base64");

        try {
          const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            new URLSearchParams({ image: base64Image }).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );

          console.log("Uploaded image URL:", response.data);
          return response.data.data.url;
        } catch (error) {
          console.error("Error uploading image:", error.response?.data || error.message);
          return null;
        }
      });

      imgUrls = await Promise.all(uploadPromises);
      imgUrls = imgUrls.filter((url) => url !== null);
    }

    console.log("Final image URLs:", imgUrls);
    console.log("IMGBB_API_KEY:", IMGBB_API_KEY);

    // Create new post
    const post = new Post({ content, author, imgUrls });
    await post.save();

    // Update user with new post ID
    const user = await User.findById(author);
    if (user) {
      user.posts.push(post._id);
      user.points += 10;
      await user.save();
    }

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(400).json({ message: "Failed to create post", error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  const { id } = req.params;
  try {
      const posts = await Post.find({ author: { $ne: id } })
      .populate("author", "displayName _id") 
      .sort({ timeStamp: -1 });
      res.status(200).send(posts);
  } catch (error) {
      res.status(500).send(error);
  }
};

exports.getPostsCount = async (req, res) => {
  try {
    const { id } = req.params;
    const postsCount = await Post.countDocuments({author:id}); 

    res.status(200).json({ postsCount});
  } catch (error) {
    console.error("Error getting posts count:", error);
    res.status(500).json({ error: error.message });
  }
};
