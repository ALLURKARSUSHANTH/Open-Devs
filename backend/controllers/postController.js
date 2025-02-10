const Post = require('../models/Post');
const User = require('../models/User'); 

exports.createPost = async (req, res) => {
  const { content , author} = req.body;
  try {
    const post = new Post({content,author});
    await post.save();
    const user = await User.findOne({ _id: author });
    user.posts.push(post._id);
    await user.save();
    
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getPosts = async (req, res) => {
  try {
      const posts = await Post.find()
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
    const posts= await Posts.findById(id);

    if (!posts) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ PostsCount: posts.posts.length });
  } catch (error) {
    console.error("Error getting followers count:", error);
    res.status(500).json({ error: error.message });
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
