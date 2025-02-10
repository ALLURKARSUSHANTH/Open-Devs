const Post = require('../models/Post');
const User = require('../models/User'); 

exports.createPost = async (req, res) => {
  const { content , author} = req.body;
  try {
    const post = new Post({content,author});
    await post.save();
    const user = await User.findOne({ _id: author });
    user.posts.push(post._id);
    user.save();
    
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
