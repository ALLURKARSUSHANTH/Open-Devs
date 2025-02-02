const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const Post = require('./models/postSchema');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  
  }
});

const upload = multer({ storage });

const db = mongoose.connect('mongodb://localhost:27017/posts', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  }
);

//api endpoint to get specific posts
app.get('/api/postByAuthor', async (req, res) => {
  const {authorName}  = req.query;
  try{
    if(authorName){
      const posts = await Post.find({authorName});
      res.json(posts);
    }
    else{
      const posts = await Post.find();
      res.json(posts);
    }
    res.json(posts);
  }
  catch(err){
    res.json({message: err});
  }
}); 


//api endpoint to get posts
app.get('/api/posts', async (req, res) => {
  try{
    const posts = await Post.find().sort({timeStamp: -1});
    res.json(posts);
    console.log(posts);
  }
  catch(err){
    res.json({message: err});
  }
}); 

// Route to create a post with multiple images
app.post('/api/posts', upload.array('images', 10), async (req, res) => {  
  const images = req.files ? req.files.map(file => file.path) : []; 

  const { title, authorId, authorName, content, link, description } = req.body;
  const timeStamp = new Date().toISOString();

  const post = new Post({
    title,
    authorId,
    authorName,
    content,
    images,
    link,
    timeStamp,
    description
  })
  try{
    const savedPost = await post.save();
    res.json(savedPost);
  }
  catch(err){
    res.json({message: err});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
