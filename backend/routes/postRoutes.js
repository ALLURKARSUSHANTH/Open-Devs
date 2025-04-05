const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.uploadMiddleware,postController.createPost);
router.get('/getPosts/:id', postController.getPosts);
router.get('/getProfile/:id', postController.getProfile);
router.post('/pushLikes/:id', postController.pushLikes);
router.get('/getLikes/:id', postController.getLikes);
router.get('/getComments/:id' ,postController.getComments);
router.post('/addComment/:id', postController.addComment);
router.post('/addReply/:postId/:commentId', postController.addReply);
router.delete('/deletePost/:id', postController.deletePost);

module.exports = router;