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
  const { content, author,codeSnippet} = req.body;
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
    const postData = { content, author, imgUrls };

    // Only add the code field if it is provided (optional)
    if (codeSnippet) {
      postData.codeSnippet = codeSnippet;
    }
    const post = new Post(postData);
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
      .populate("author", "displayName _id photoURL") 
      .sort({ timeStamp: -1 });
      res.status(200).send(posts);
  } catch (error) {
      res.status(500).send(error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({author:id})
    .populate("author", "displayName _id photoURL") 
    .sort({ timeStamp: -1 });
    const count = posts.length;
    res.status(200).json({ posts, count });
  } catch (error) {
    console.error("Error getting posts count:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.pushLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if(post.likes.includes(userId)){
      post.likes.pull(userId);
      await post.save();
      return res.status(200).json({ message: "Unliked" });
    }
    post.likes.addToSet(userId);
    await post.save();
    res.status(200).json({ message: "Likes updated successfully" });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { user, text } = req.body; 

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = { user, text, timeStamp: new Date() };
    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { id } = req.params; 
    const post = await Post.findById(id).populate("comments.user   comments.replies.user", "displayName photoURL");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { user, text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = { user, text, timeStamp: new Date() };
    comment.replies.push(newReply);
    await post.save();

    res.status(201).json({ message: "Reply added successfully", reply: newReply });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the post to get the author
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    // Remove the post reference from the user's posts array
    await User.findByIdAndUpdate(
      post.author, // The author's ID from the post
      { $pull: { posts: id } }, // Remove the post ID from the posts array
      { new: true }
    );

    res.status(200).json({ 
      message: "Post deleted successfully",
      deletedPostId: id
    });
  } catch (error) {
    console.error("Error in deletePost:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};
