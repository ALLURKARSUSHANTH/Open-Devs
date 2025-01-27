const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Setup multer to handle multiple files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Specify the folder to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp to avoid naming collisions
  }
});

const upload = multer({ storage });

// Store posts data in-memory (use a database for production)
let posts = [];

app.get('/api/posts', (req, res) => {
  res.json(posts);
}); 

// Route to create a post with multiple images
app.post('/api/posts', upload.array('images', 10), (req, res) => {  // 'images' is the field name, 10 is the max number of images
  const images = req.files ? req.files.map(file => file.path) : [];  // Collect paths of uploaded images

  const post = {
    id: Date.now().toString(),
    authorId: req.body.authorId,
    authorName: req.body.authorName,
    content: req.body.content,
    link: req.body.link,
    images: images,  // Store array of image paths
    timeStamp: new Date().toISOString(),
  };

  console.log(post);  // Log the post to the console
  posts.push(post);  // Add post to in-memory data (replace with database in production)
  res.json(post);  // Respond with the created post
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
