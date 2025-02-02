import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, CardMedia, Button } from '@mui/material';
import axios from 'axios';
import { useTheme } from '../Theme/toggleTheme';

const GetPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/posts')  
      .then((response) => {
        setPosts(response.data); 
        setLoading(false); 
      })
      .catch((error) => {
        setError('Error fetching posts'); 
        setLoading(false); 
      });
  }, []);

  const [expandedPost, setExpandedPost] = useState(null);

  const handleExpandClick = (postId) => {
    setExpandedPost((prevExpandedPost) =>
      prevExpandedPost === postId ? null : postId
    );
  };

  if (loading) {
    return <div>Loading...</div>;  
  }

  if (error) {
    return <div>{error}</div>;  
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '20px' }}>
      {posts.map((post) => (
        <Card
          key={post._id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme === 'dark' ? '0px 6px 15px rgba(0, 0, 0, 0.3)' : '0px 4px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            background: theme === 'dark' ? '#1c1c1c' : 'linear-gradient(145deg, #f3f4f6, #e1e2e5)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: theme === 'dark' ? '0px 6px 20px rgba(0, 0, 0, 0.4)' : '0px 6px 15px rgba(0, 0, 0, 0.2)',
            },
            padding: 2,
          }}
        >
          <CardContent sx={{ padding: '16px' }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#333',
                marginBottom: '10px',
              }}
            >
              {post.title}
            </Typography>
            <Typography
              color={theme === 'dark' ? 'text.secondary' : 'text.primary'}
              sx={{ fontSize: '14px' }}
            >
              <span style={{ fontWeight: 'bold' }}>Author:</span> {post.authorName}
              <br />
              <span style={{ fontWeight: 'bold' }}>Link:</span> <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? '#1d72b8' : '#1d72b8' }}>{post.link}</a>
            </Typography>
          </CardContent>

          <CardMedia
            component="img"
            src={post.image || 'https://via.placeholder.com/600x300'}
            alt="Post image"
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          />

          <CardContent sx={{ padding: '16px' }}>
            <Typography
              color={theme === 'dark' ? 'text.secondary' : 'text.primary'}
              sx={{ fontSize: '14px' }}
            >
              <span style={{ fontWeight: 'bold' }}>Content:</span> 
              {expandedPost === post._id ? (
                <span>{post.content}</span>
              ) : (
                <span>
                  {post.content.length > 200 ? `${post.content.slice(0, 200)}...` : post.content}
                </span>
              )}
            </Typography>

            {post.content.length > 200 && (
              <Button
                sx={{ marginTop: '10px', padding: '6px 16px' }}
                onClick={() => handleExpandClick(post._id)}
              >
                {expandedPost === post._id ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GetPosts;
