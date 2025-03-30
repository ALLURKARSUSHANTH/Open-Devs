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
      .populate("author", "displayName _id photoURL") 
      .sort({ timeStamp: -1 });
      res.status(200).send(posts);
  } catch (error) {
      res.status(500).send(error);
  }
};

exports.getMyPosts = async (req, res) => {
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
  const { id } = req.params;
  
  console.log('--- DELETE POST REQUEST ---');
  console.log('Post ID:', id);
  console.log('Authorization header:', req.headers.authorization);
  
  try {
    // Verify JWT token first
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user ID:', decoded.userId);

    const post = await Post.findById(id);
    if (!post) {
      console.log('Post not found in database');
      return res.status(404).json({ message: "Post not found" });
    }

    // Verify post ownership
    if (post.author.toString() !== decoded.userId) {
      console.log('User not authorized to delete this post');
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    // Remove post from user's posts array
    const user = await User.findById(decoded.userId);
    if (user) {
      user.posts.pull(post._id);
      await user.save();
      console.log('Post removed from user document');
    }

    // Delete the post
    await Post.findByIdAndDelete(id);
    console.log('Post deleted from database');

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    res.status(500).json({ 
      message: "Error deleting post",
      error: error.message 
    });
  }
}