import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Button, 
  Box, 
  Typography, 
  Stack, 
  TextField, 
  Paper,
  IconButton,
  Chip,
  Divider,
  Tooltip
} from "@mui/material";
import { 
  Code as CodeIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Videocam as VideoIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { auth } from "../firebase/firebaseConfig";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  maxWidth: 800,
  margin: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const ImagePreview = styled('img')(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover',
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

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

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAuthorId(user.uid);
    }
  }, []);

  const handleCode = () => {
    setAddSnippet(!addSnippet);
    if (!addSnippet) {
      setEditorHeight(200);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      const lineCount = editor.getModel().getLineCount();
      if (lineCount > 30) {
        const position = editor.getPosition();
        
        if (position.lineNumber >= 30) {
          const lines = editor.getValue().split('\n');
          const validContent = lines.slice(0, 30).join('\n');
          editor.setValue(validContent);
          
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

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviewImages(newPreviews);
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
      const response = await axios.post(`${API_URL}/posts/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Post created successfully!");
      setContent("");
      setCodeSnippet("");
      setImages([]);
      setPreviewImages([]);
      setAddSnippet(false);
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert(`Failed to create post: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <StyledPaper>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Create a New Post
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="What's on your mind?"
            variant="outlined"
            fullWidth
            required
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <Stack direction="row" spacing={2}>
            <Tooltip title="Add code snippet">
              <Button 
                variant={addSnippet ? "contained" : "outlined"} 
                onClick={handleCode}
                startIcon={<CodeIcon />}
                sx={{ borderRadius: 2 }}
              >
                {addSnippet ? "Remove Code" : "Add Code"}
              </Button>
            </Tooltip>

            <Tooltip title="Upload images (max 5)">
              <Button 
                variant="outlined" 
                component="label"
                startIcon={<ImageIcon />}
                sx={{ borderRadius: 2 }}
              >
                Upload Images
                <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
              </Button>
            </Tooltip>

            <Tooltip title="Start a live stream">
              <Button 
                variant="outlined" 
                onClick={() => navigate("/stream")}
                startIcon={<VideoIcon />}
                sx={{ borderRadius: 2 }}
              >
                Go Live
              </Button>
            </Tooltip>
          </Stack>

          {addSnippet && (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
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
                  fontSize: 14,
                }}
              />
              <Box sx={{ bgcolor: 'background.paper', p: 1, textAlign: 'right' }}>
                <Chip 
                  label={`${codeSnippet.split('\n').length}/30 lines`} 
                  size="small" 
                  color={codeSnippet.split('\n').length >= 30 ? 'error' : 'default'}
                />
              </Box>
            </Box>
          )}

          {previewImages.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Image Previews ({previewImages.length}/5)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {previewImages.map((src, index) => (
                  <Box key={index} sx={{ position: 'relative', mr: 1, mb: 1 }}>
                    <ImagePreview src={src} alt={`Preview ${index}`} />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!authorId || !content.trim()}
              startIcon={<SendIcon />}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1,
                fontWeight: 'bold'
              }}
            >
              Post
            </Button>
          </Box>
        </Stack>
      </form>
    </StyledPaper>
  );
};

export default Post;