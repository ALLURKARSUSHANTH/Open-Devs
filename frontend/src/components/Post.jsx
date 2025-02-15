import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Stack } from "@mui/material";
import { auth } from "../firebase/firebaseConfig";

const Post = () => {
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAuthorId(user.uid);
    }
  }, []);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
      alert("You can upload up to 5 images.");
      return;
    }

    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!authorId || !content.trim()) {
      alert("User not authenticated or content is empty");
      return;
    }
  
    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("author", authorId);
  
    images.forEach((image, index) => {
      formData.append("images", image, image.name); 
    });
  
    console.log("FormData Entries:", [...formData.entries()]);
  
    try {
      const response = await axios.post("http://localhost:5000/posts/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert("Post created successfully!");
      console.log("Response:", response.data);
      setContent("");
      setImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert(`Failed to create post: ${error.response?.data?.message || error.message}`);
    }
  };
  

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: '3px' }}>
      <Typography variant="h4" gutterBottom>
        Create a New Post
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
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
            Upload Images (Max: 5)
            <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
          </Button>

          <Stack direction="row" spacing={1}>
            {previewImages.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index}`} width="80" height="80" style={{ borderRadius: "5px" }} />
            ))}
          </Stack>

          <Button type="submit" variant="contained" disabled={!authorId || !content.trim()}>
            Submit Post
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Post;
