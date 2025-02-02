import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Stack } from '@mui/material';

const Post = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); 
  const [link, setLink] = useState('');
  const [authorId, setAuthorId] = useState('');  
  const [authorName, setAuthorName] = useState('');  

  const handleFileChange = (event) => {
    const files = event.target.files;
    setImages([...files]);  
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('link', link);
    formData.append('authorId', authorId);  
    formData.append('authorName', authorName);  

    images.forEach((image) => {
      formData.append('images', image);  
    });

    try {
      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Post created successfully!');
      console.log(response.data);
    } catch (error) {
      console.error('Error creating post', error);
      alert('Failed to create post');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create a New Post
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Link to repository"
            variant="outlined"
            required
            fullWidth
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <TextField
            label="Author ID"
            variant="outlined"
            required
            fullWidth
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)} 
          />
          <TextField
            label="Author Name"
            variant="outlined"
            required
            fullWidth
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <TextField
            label="Content"
            variant="outlined"
            fullWidth
            required
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button variant="outlined" component="label">
            Upload Images
            <input
              type="file"
              hidden
              accept="image/*"
              name="images"  
              multiple 
              onChange={handleFileChange}
            />
          </Button>

          {images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Selected Images:</Typography>
              <Stack direction="row" spacing={2}>
                {images.map((image, index) => (
                  <Box key={index}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`preview-${index}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '600px',
                        marginTop : '10px',
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Button type="submit" variant="contained">
            Submit Post
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Post;
