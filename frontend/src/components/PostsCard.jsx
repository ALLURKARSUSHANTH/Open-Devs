import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Stack,
  Tooltip,
  Box
} from '@mui/material';
import {
  FavoriteBorderOutlined,
  CommentOutlined,
  Favorite
} from '@mui/icons-material';
import MonacoEditor from "@monaco-editor/react";

const PostCard = ({ 
  post, 
  isExpanded = false, 
  onClick,
  loggedInUserId,
  handleFollowToggle,
  handleConnectToggle,
  handleLike,
  toggleCommentInput,
  toggleExpand,
  openModal,
  theme
}) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const isAuthor = post.author?._id === loggedInUserId;

  return (
    <Card
      sx={{
        padding: 2,
        borderRadius: "12px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={!isExpanded ? onClick : undefined}
    >
      {/* Author and follow/connect buttons */}
      {!isAuthor && post.author?._id && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button
              color={post.isFollowing ? "error" : "primary"}
              size="small"
              sx={{ borderRadius: "8px" }}
              onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle(post.author._id);
              }}
            >
              {post.isFollowing ? "Unfollow" : "Follow"}
            </Button>
            {!post.isConnected && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                sx={{ borderRadius: "8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnectToggle(post.author._id);
                }}
              >
                Connect
              </Button>
            )}
          </Stack>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Avatar
            src={post.author?.photoURL}
            alt={post.author?.displayName?.[0]}
            sx={{ width: 50, height: 50 }}
          />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {post.author?.displayName || "Unknown Author"}
          </Typography>
        </Stack>

        <Typography paragraph>
          {post.expanded || post.content.length <= 100
            ? post.content
            : `${post.content.substring(0, 100)}...`}
          {post.content.length > 100 && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(post._id);
              }}
            >
              {post.expanded ? "See Less" : "See More"}
            </Button>
          )}
        </Typography>

        {/* Images */}
        {post.imgUrls?.length > 0 && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: isExpanded ? "400px" : "200px",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
              mb: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              openModal(post.imgUrls);
            }}
          >
            <img
              src={post.imgUrls[0]}
              alt="Post"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {post.imgUrls.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "0 0 0 8px",
                }}
              >
                +{post.imgUrls.length - 1}
              </Box>
            )}
          </Box>
        )}

        {/* Code Snippet */}
        {post.codeSnippet && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Code Snippet:
            </Typography>
            {editorLoaded || isExpanded ? (
              <MonacoEditor
                height={isExpanded ? "300px" : "200px"}
                language="javascript"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={post.codeSnippet}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <Box
                sx={{
                  height: "200px",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                }}
                onMouseEnter={() => setEditorLoaded(true)}
              >
                <Typography>Click to view code</Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Like">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleLike(post._id);
            }}
          >
            {post.isLikedByUser ? (
              <Favorite sx={{ color: "red" }} />
            ) : (
              <FavoriteBorderOutlined />
            )}
            <Typography sx={{ ml: 0.5 }}>
              {post.likes?.length || 0}
            </Typography>
          </IconButton>
        </Tooltip>

        <Tooltip title="Comment">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleCommentInput(post._id);
            }}
          >
            <CommentOutlined />
            <Typography sx={{ ml: 0.5 }}>
              {post.comments?.length || 0}
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default PostCard;