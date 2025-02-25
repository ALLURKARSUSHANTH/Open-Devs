const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.uploadMiddleware,postController.createPost);
router.get('/getPosts/:id', postController.getPosts);
router.get('/getPostsCount/:id', postController.getPostsCount);
router.post('/pushLikes/:id', postController.pushLikes);
router.get('/getLikes/:id', postController.getLikes);
router.get('/getComments/:id' ,postController.getComments);
router.post('/addComment/:id', postController.addComment);
module.exports = router;