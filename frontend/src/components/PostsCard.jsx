import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  ButtonBase,
  Modal,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import {
  Favorite as LikeIcon,
  ChatBubbleOutline as CommentIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const PostsCard = ({ posts, fetchPosts }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      setIsDeleting(true);
      console.log('Attempting to delete post ID:', selectedPost._id); // Debug log
      console.log('Current token:', localStorage.getItem('token')); // Debug token
      
      const response = await axios.delete(
        `http://localhost:5000/posts/deletepost/${selectedPost._id}`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Delete response:', response); // Full response log
      
      if (response.status === 200) {
        await fetchPosts();
        handleClose();
      }
    } catch (error) {
      console.error('Full error object:', error); // Log entire error
      console.error('Error response data:', error.response?.data); // Backend error message
      console.error('Error status code:', error.response?.status); // HTTP status
      console.error('Error headers:', error.response?.headers); // Response headers
      
      // Show error to user (you can use a snackbar or alert)
      alert(`Failed to delete post: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card sx={{ borderRadius: 2, boxShadow: 3, marginTop: 1, width: '100%', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
            Posts
          </Typography>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
                <ButtonBase 
                  onClick={() => handlePostClick(post)}
                  sx={{ width: '100%', textAlign: 'left' }}
                >
                  <Card sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Post Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <ListItemAvatar>
                          <Avatar src={post.author?.photoURL} alt={post.author.displayName} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={post.author.displayName}
                          secondary={new Date(post.timeStamp).toLocaleString()}
                          sx={{ flexGrow: 1 }}
                        />
                      </Box>

                      {/* Post Content */}
                      <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                        {post.content}
                      </Typography>

                      {/* Post Images (if available) */}
                      {post.imgUrls && post.imgUrls.length > 0 && (
                        <Box
                          component="img"
                          src={post.imgUrls[0]}
                          alt="Post thumbnail"
                          sx={{ width: '100%', borderRadius: 2, mb: 2, maxHeight: 200, objectFit: 'cover' }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </ButtonBase>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Modal for detailed post view */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          width: '80%', 
          maxWidth: 1200, 
          maxHeight: '90vh', 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Post content */}
          <Box sx={{ 
            flex: 2, 
            overflowY: 'auto', 
            p: 3,
            borderRight: { md: '1px solid' },
            borderColor: { md: 'divider' }
          }}>
            {selectedPost && (
              <>
                {/* Post Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ListItemAvatar>
                    <Avatar src={selectedPost.author?.photoURL} alt={selectedPost.author.displayName} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={selectedPost.author.displayName}
                    secondary={new Date(selectedPost.timeStamp).toLocaleString()}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>

                {/* Post Content */}
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedPost.content}
                </Typography>

                {/* Post Images */}
                {selectedPost.imgUrls && selectedPost.imgUrls.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {selectedPost.imgUrls.map((imgUrl, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={imgUrl}
                        alt={`Post Image ${index + 1}`}
                        sx={{ width: '100%', borderRadius: 2, maxHeight: 400, objectFit: 'contain' }}
                      />
                    ))}
                  </Box>
                )}

                {/* Like, Comment, and Delete actions */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mt: 3, 
                  pt: 2, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LikeIcon color="error" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {selectedPost.likes?.length || 0} likes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CommentIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {selectedPost.comments?.length || 0} comments
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    color="error"
                    sx={{ ml: 'auto' }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </Box>
              </>
            )}
          </Box>

          {/* Comments section */}
          <Box sx={{ 
            flex: 1, 
            p: 3, 
            overflowY: 'auto',
            borderTop: { xs: '1px solid', md: 'none' },
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Comments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {selectedPost?.comments?.length > 0 ? (
              selectedPost.comments.map((comment, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar 
                      src={comment.user?.photoURL} 
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="subtitle2">
                      {comment.user?.displayName}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {comment.text}
                  </Typography>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments yet
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PostsCard;