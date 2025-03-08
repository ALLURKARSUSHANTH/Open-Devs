const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.uploadMiddleware,postController.createPost);
router.get('/getPosts/:id', postController.getPosts);
router.get('/getMyPosts/:id', postController.getMyPosts);
router.post('/pushLikes/:id', postController.pushLikes);
router.get('/getLikes/:id', postController.getLikes);
router.get('/getComments/:id' ,postController.getComments);
router.post('/addComment/:id', postController.addComment);
router.post('/addReply/:postId/:commentId', postController.addReply);

module.exports = router;