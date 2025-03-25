import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Box,
} from '@mui/material';
import {
  FavoriteBorder as LikeIcon,
  Favorite as LikedIcon,
  ChatBubbleOutline as CommentIcon,
} from '@mui/icons-material';

const PostsCard = ({ posts }) => {
  const [likedPosts, setLikedPosts] = useState({}); // Track liked posts

  // Handle like button click
  const handleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle like status
    }));
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, marginTop: 1, width: '100%', maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
          Posts
        </Typography>
        <List>
          {posts.map((post) => (
            <ListItem key={post._id} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
              {/* Post Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemAvatar>
                  <Avatar src={post.author.photoURL} alt={post.author.displayName} />
                </ListItemAvatar>
                <ListItemText
                  primary={post.author.displayName}
                  secondary={new Date(post.timeStamp).toLocaleString()} // Add timestamp
                  sx={{ flexGrow: 1 }}
                />
              </Box>

              {/* Post Content */}
              <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                {post.content}
              </Typography>

              {/* Post Images (if available) */}
              {post.imgUrls && post.imgUrls.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {post.imgUrls.map((imgUrl, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={imgUrl}
                      alt={`Post Image ${index + 1}`}
                      sx={{ width: '100%', maxWidth: 300, borderRadius: 2, mb: 2 }}
                    />
                  ))}
                </Box>
              )}

              {/* Like and Comment Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <IconButton onClick={() => handleLike(post._id)}>
                  {likedPosts[post._id] || post.likes.length > 0 ? (
                    <LikedIcon color="error" />
                  ) : (
                    <LikeIcon />
                  )}
                </IconButton>
                <IconButton>
                  <CommentIcon />
                </IconButton>
              </Box>

              {/* Display Likes Count */}
              <Typography variant="body2" sx={{ mb: 1 }}>
                {post.likes.length} likes
              </Typography>

              {/* Display Comments (if available) */}
              {post.comments && post.comments.length > 0 && (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Comments:
                  </Typography>
                  {post.comments.map((comment, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                      <Typography variant="body2">{comment}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default PostsCard;