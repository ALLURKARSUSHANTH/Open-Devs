import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText, // Import ListItemText here
} from '@mui/material';

const PostsCard = ({ posts }) => {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: 6, marginTop: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Posts
        </Typography>
        <List>
          {posts.map((post) => (
            <ListItem key={post._id}>
              <ListItemAvatar>
                <Avatar src={post.photoURL} alt={post.displayName} />
              </ListItemAvatar>
              <ListItemText
                primary={post.title}
                secondary={post.description}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default PostsCard;