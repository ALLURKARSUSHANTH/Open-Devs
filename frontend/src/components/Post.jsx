import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Stack } from "@mui/material";
import { auth } from "../firebase/firebaseConfig";

const Post = () => {
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("");

  useEffect(() => {
    const user = auth.currentUser; 
    if (user) {
      setAuthorId(user.uid);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!authorId || !content.trim()) {
      alert("User not authenticated or content is empty");
      return;
    }

    const postData = {
      content: content.trim(),
      author: authorId,
    };

    console.log("Sending post data:", postData); 

    try {
      const response = await axios.post(
        "http://localhost:5000/posts/create",
       postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );      

      alert("Post created successfully!");
      console.log(response.data);
      setContent("");
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert(`Failed to create post: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
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
          <Button type="submit" variant="contained" disabled={!authorId || !content.trim()}>
            Submit Post
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Post;
