import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Box, Typography, Stack, TextField } from "@mui/material";
import { auth } from "../firebase/firebaseConfig";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import VideoStream from "./VideoStream";

const Post = () => {
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [addSnippet, setAddSnippet] = useState(false);
  const [editorHeight, setEditorHeight] = useState(200);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAuthorId(user.uid);
    }
  }, []);

  const handleCode = () => {
    setAddSnippet(!addSnippet);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      const lineCount = editor.getModel().getLineCount();
      if (lineCount > 30) {
        // Get current cursor position
        const position = editor.getPosition();
        
        // If cursor is at or beyond line 30, prevent changes
        if (position.lineNumber >= 30) {
          // Revert to previous valid state
          const lines = editor.getValue().split('\n');
          const validContent = lines.slice(0, 30).join('\n');
          editor.setValue(validContent);
          
          // Move cursor to last valid position
          const newPosition = {
            lineNumber: Math.min(position.lineNumber, 30),
            column: position.column
          };
          editor.setPosition(newPosition);
          alert("Cannot exceed 30 lines of code!");
        }
      }
    });
  };

  const handleCodeSnippetChange = (value) => {
    setCodeSnippet(value);
    const lineCount = value.split("\n").length;
    let newHeight = 200;
    setEditorHeight(newHeight);
  };

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
    formData.append("codeSnippet", codeSnippet.trim());

    images.forEach((image, index) => {
      formData.append("images", image, image.name);
    });

    try {
      const response = await axios.post("http://localhost:5000/posts/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Post created successfully!");
      setContent("");
      setCodeSnippet("");
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

          <Button onClick={handleCode}>
            Add Code Snippet
          </Button>

          {addSnippet && (
            <MonacoEditor
              value={codeSnippet}
              onChange={handleCodeSnippetChange}
              height={`${editorHeight}px`}
              language="javascript"
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                selectOnLineNumbers: true,
                wordWrap: "on",
                lineNumbers: true,
                scrollBeyondLastLine: false,
                minimap: { enabled: false },
              }}
            />
          )}

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

          <Button variant="contained" onClick={() => navigate("/stream")}>
              Start a Stream
        </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Post;