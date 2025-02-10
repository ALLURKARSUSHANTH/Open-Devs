const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.createPost);
router.get('/getPosts', postController.getPosts);
router.get('/getPostsCount/:id', postController.getPostsCount);

module.exports = router;