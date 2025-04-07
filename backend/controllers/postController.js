const Post = require('../models/Post');
const User = require('../models/User');
const axios = require('axios');
const multer = require('multer');
const {POINT_RULES,getCurrentLevel} = require('../utils/levels');
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
      user.points += POINT_RULES.postCreated;
      
      // Check for level up
      const newLevel = getCurrentLevel(user.points);
      if (newLevel !== user.level) {
        user.level = newLevel;
      }
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
    // Get current user with relationships and additional relevant fields
    const currentUser = await User.findById(id)
      .select('skills level following connections posts likedPosts');
    
    if (!currentUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Debug: Print current user info
    console.log('\n=== CURRENT USER ===');
    console.log(`User ID: ${id}`);
    console.log(`Skills: ${currentUser.skills.join(', ')}`);
    console.log(`Level: ${currentUser.level}`);
    console.log(`Following: ${currentUser.following.join(', ')}`);
    console.log(`Connections: ${currentUser.connections.join(', ')}`);

    // Get all posts except user's own
    let posts = await Post.find({ author: { $ne: id } })
      .populate('author', 'displayName skills level followers following')
      .lean();

    // Define scoring weights (easily adjustable)
    const weights = {
      directConnection: 40,    // Direct connections (highest priority)
      following: 25,           // Users you follow
      skillMatch: 15,          // Per matching skill
      sameLevel: 10,           // Same experience level
      userLike: 2,             // You liked this post
      otherLike: 0.7,          // Others liked this post
      recency: 0.2,            // Per hour within 24hrs
      authorPopularity: 0.1    // Per follower of author
    };

    // Calculate scores for each post
    posts = posts.map(post => {
      let score = 0;
      const scoreDetails = {};

      // 1. Connection type scoring
      if (currentUser.connections.includes(post.author._id.toString())) {
        scoreDetails.connectionType = 'Direct Connection';
        score += weights.directConnection;
      } 
      else if (currentUser.following.includes(post.author._id.toString())) {
        scoreDetails.connectionType = 'Following';
        score += weights.following;
      } else {
        scoreDetails.connectionType = 'No Connection';
      }

      // 2. Skill matching (more skills = higher score)
      const commonSkills = post.author.skills.filter(skill => 
        currentUser.skills.includes(skill)
      ).length;
      scoreDetails.skillMatches = commonSkills;
      score += commonSkills * weights.skillMatch;

      // 3. Level matching
      scoreDetails.levelMatch = post.author.level === currentUser.level;
      score += scoreDetails.levelMatch ? weights.sameLevel : 0;

      // 4. Engagement (weighted by your likes vs others)
      const yourLike = currentUser.likedPosts?.includes(post._id.toString()) ? weights.userLike : 0;
      const otherLikes = post.likes.length * weights.otherLike;
      scoreDetails.engagement = {
        yourLike,
        otherLikes,
        total: yourLike + otherLikes
      };
      score += scoreDetails.engagement.total;

      // 5. Recency (diminishing over 24 hours)
      const hoursOld = (new Date() - new Date(post.timeStamp)) / (1000 * 60 * 60);
      scoreDetails.recency = Math.max(0, 24 - hoursOld) * weights.recency;
      score += scoreDetails.recency;

      // 6. Author popularity
      scoreDetails.authorPopularity = post.author.followers?.length * weights.authorPopularity || 0;
      score += scoreDetails.authorPopularity;

      // 7. Penalize posts you've already interacted with
      if (currentUser.likedPosts?.includes(post._id.toString())) {
        scoreDetails.alreadyLiked = -5; // Small penalty to vary content
        score -= 5;
      }

      return {
        ...post,
        _score: Math.round(score * 100) / 100,
        _scoreDetails: scoreDetails
      };
    });

    // Sort by score (descending), then by recency for equal scores
    posts.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.timeStamp) - new Date(a.timeStamp);
    });

    // Debug: Print top 5 posts with scoring details
    console.log('\n=== TOP 5 POSTS ===');
    posts.slice(0, 5).forEach((post, index) => {
      console.log(`\n#${index + 1} (Score: ${post._score})`);
      console.log(`Content: ${post.content.substring(0, 50)}...`);
      console.log(`Author: ${post.author.displayName} (${post.author._id})`);
      console.log(`Connection: ${post._scoreDetails.connectionType}`);
      console.log(`Skill Matches: ${post._scoreDetails.skillMatches}`);
      console.log(`Level Match: ${post._scoreDetails.levelMatch}`);
      console.log(`Engagement: ${post._scoreDetails.engagement.total} (Your like: ${post._scoreDetails.engagement.yourLike})`);
      console.log(`Recency: ${post._scoreDetails.recency.toFixed(2)}`);
      console.log(`Author Popularity: ${post._scoreDetails.authorPopularity.toFixed(2)}`);
    });

    // Return posts without debug info (optional: keep _score for client-side debugging)
    const response = posts.map(post => {
      const { _scoreDetails, ...rest } = post;
      return {
        ...rest,
        _score: post._score // Optional: include score in response
      };
    });
    
    res.status(200).send(response);

  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).send({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : null
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({author:id})
    .populate("author", "displayName _id photoURL points level followers following") 
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

    const author = await User.findById(post.author);
    if (author) {
      author.points += POINT_RULES.postLiked;
      const newLevel = getCurrentLevel(author.points);
      if (newLevel !== author.level) {
        author.level = newLevel;
      }
      await author.save();
    }

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

    const commenter = await User.findById(user);
    if (commenter) {
      commenter.points += POINT_RULES.commentAdded;
      const newLevel = getCurrentLevel(commenter.points);
      if (newLevel !== commenter.level) {
        commenter.level = newLevel;
      }
      await commenter.save();
    }

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
