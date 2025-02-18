const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.uploadMiddleware,postController.createPost);
router.get('/getPosts/:id', postController.getPosts);
router.get('/getPostsCount/:id', postController.getPostsCount);

module.exports = router;