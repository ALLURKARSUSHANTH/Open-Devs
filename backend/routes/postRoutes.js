const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.uploadMiddleware,postController.createPost);
router.get('/getPosts/:id', postController.getPosts);
router.post('/pushLikes/:id', postController.pushLikes);
router.get('/getLikes/:id', postController.getLikes);
router.get('/getComments/:id' ,postController.getComments);
router.post('/addComment/:id', postController.addComment);
//router.delete('/deleteComment/:id', postController.deleteComment);
//router.delete('/deletePost/:id', postController.deletePost);
module.exports = router;