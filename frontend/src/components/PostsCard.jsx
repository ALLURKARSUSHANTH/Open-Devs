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
  Box,
  CircularProgress
} from '@mui/material';
import {
  FavoriteBorderOutlined,
  CommentOutlined,
  Favorite
} from '@mui/icons-material';
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';

const PostCard = ({ 
  post, 
  isExpanded , 
  expandedPosts = {},
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
  const [localState, setLocalState] = useState({
    isLiked: post.isLikedByUser,
    likeCount: post.likes?.length || 0,
    isFollowing: post.isFollowing,
    isConnecting: false,
    isConnected: post.isConnected
  });
  

  const isAuthor = post.author?._id === loggedInUserId;
  const navigate = useNavigate();

  const handleOptimisticLike = async (e, postId) => {
    e.stopPropagation();
    const wasLiked = localState.isLiked;
    const newLikeCount = wasLiked ? localState.likeCount - 1 : localState.likeCount + 1;
    
    setLocalState(prev => ({
      ...prev,
      isLiked: !wasLiked,
      likeCount: newLikeCount
    }));

    try {
      await handleLike(postId);
    } catch (error) {
      // Revert if the API call fails
      setLocalState(prev => ({
        ...prev,
        isLiked: wasLiked,
        likeCount: localState.likeCount
      }));
    }
  };

  const handleOptimisticFollow = async (e, userId) => {
    e.stopPropagation();
    const wasFollowing = localState.isFollowing;
    
    setLocalState(prev => ({
      ...prev,
      isFollowing: !wasFollowing
    }));

    try {
      await handleFollowToggle(userId);
    } catch (error) {
      // Revert if the API call fails
      setLocalState(prev => ({
        ...prev,
        isFollowing: wasFollowing
      }));
    }
  };

  const handleOptimisticConnect = async (e, userId) => {
    e.stopPropagation();
    setLocalState(prev => ({
      ...prev,
      isConnecting: true
    }));

    try {
      await handleConnectToggle(userId);
      setLocalState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false
      }));
    } catch (error) {
      setLocalState(prev => ({
        ...prev,
        isConnecting: false
      }));
    }
  };

  return (
    <Card
      sx={{
        padding: 2,
        borderRadius: "12px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
      onClick={!isExpanded ? onClick : undefined}
    >
      {/* Author and follow/connect buttons */}
      {!isAuthor && post.author?._id && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button
              color={localState.isFollowing ? "error" : "primary"}
              size="small"
              sx={{ borderRadius: "8px" }}
              onClick={(e) => handleOptimisticFollow(e, post.author._id)}
              disabled={localState.isConnecting}
            >
              {localState.isFollowing ? "Unfollow" : "Follow"}
            </Button>
            {!localState.isConnected && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                sx={{ borderRadius: "8px" }}
                onClick={(e) => handleOptimisticConnect(e, post.author._id)}
                disabled={localState.isConnecting}
                startIcon={localState.isConnecting ? <CircularProgress size={14} /> : null}
              >
                {localState.isConnecting ? "Connecting..." : "Connect"}
              </Button>
            )}
          </Stack>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}
        onClick={(e) => {
          e.stopPropagation();
          const uid = post.author?._id;
          if (uid) {
            // Navigate to author's profile
            console.log(`Navigate to profile of ${uid}`);
            navigate(`/profile/${uid}`);
          }
        }}>
          <Avatar
            src={post.author?.photoURL}
            alt={post.author?.displayName?.[0]}
            sx={{ width: 50, height: 50 ,cursor:"pointer"}}
          />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {post.author?.displayName || "Unknown Author"}
          </Typography>
        </Stack>

        <Typography paragraph>
          {expandedPosts[post._id] || post.content.length <= 100
            ? post.content
            : `${post.content.substring(0, 100)}...`}
          {post.content.length > 100 && (
            <Button
              size="small"
              onClick={() => {
                toggleExpand(post._id);  // Make sure this is called
              }}
              sx={{ color: 'primary.main' }}
            >
              {expandedPosts[post._id] ? "See Less" : "See More"}
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
              transition: 'height 0.3s ease'
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
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                loading={<CircularProgress />}
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
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onMouseEnter={() => setEditorLoaded(true)}
              >
                <Typography color="text.secondary">Click to view code</Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Like">
          <IconButton
            onClick={(e) => handleOptimisticLike(e, post._id)}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          >
            {localState.isLiked ? (
              <Favorite sx={{ color: "red" }} />
            ) : (
              <FavoriteBorderOutlined />
            )}
            <Typography sx={{ ml: 0.5 }}>
              {localState.likeCount}
            </Typography>
          </IconButton>
        </Tooltip>

        <Tooltip title="Comment">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleCommentInput(post._id);
            }}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)'
              }
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