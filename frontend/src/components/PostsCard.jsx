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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  FavoriteBorderOutlined,
  CommentOutlined,
  Favorite,
  DeleteOutline,
  MoreVert
} from '@mui/icons-material';
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';

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
  theme,
  handleDelete,
  showActions = true
}) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [localState, setLocalState] = useState({
    isLiked: post.isLikedByUser,
    likeCount: post.likes?.length || 0,
    isFollowing: post.isFollowing,
    isConnecting: false,
    isConnected: post.isConnected
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

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
      setLocalState(prev => ({
        ...prev,
        isLiked: wasLiked,
        likeCount: localState.likeCount
      }));
      setError('Failed to like post');
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
      setLocalState(prev => ({
        ...prev,
        isFollowing: wasFollowing
      }));
      setError('Failed to update follow status');
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
      setError('Failed to connect');
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setIsDeleting(true);
    try {
      await handleDelete(post._id);
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
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
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
      onClick={!isExpanded ? onClick : undefined}
    >
      {/* Header with author info and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center"
          onClick={(e) => {
            e.stopPropagation();
            const uid = post.author?._id;
            if (uid) {
              navigate(`/profile/${uid}`);
            }
          }}
          sx={{ cursor: 'pointer' }}
        >
          <Avatar
            src={post.author?.photoURL}
            alt={post.author?.displayName?.[0]}
            sx={{ width: 50, height: 50 ,cursor:"pointer"}}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {post.author?.displayName || "Unknown Author"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        <Box>
          {!isAuthor && post.author?._id && (
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
          )}

          {isAuthor && (
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, py: 0 }}>
        {/* Post Content */}
        <Typography paragraph sx={{ mb: 2 }}>
          {post.expanded || post.content.length <= 100
            ? post.content
            : `${post.content.substring(0, 100)}...`}
          {post.content.length > 100 && (
            <Button
              size="small"
              onClick={() => {
                toggleExpand(post._id);  // Make sure this is called
              }}
              sx={{ color: 'primary.main', ml: 1 }}
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
                language={post.codeLanguage || "javascript"}
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
      {showActions && (
        <Box sx={{
          display: "flex",
          gap: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 'auto',
          pt: 1
        }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Like">
              <IconButton
                onClick={(e) => handleOptimisticLike(e, post._id)}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    color: 'error.main'
                  }
                }}
              >
                {localState.isLiked ? (
                  <Favorite sx={{ color: "error.main" }} />
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
                    transform: 'scale(1.1)',
                    color: 'primary.main'
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

          {/* DELETE Button (only shown to author) */}
          {isAuthor && (
            <Tooltip title="Delete">
              <IconButton
                onClick={handleDeleteClick}
                sx={{
                  transition: 'all 0.2s ease-out',
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    transform: 'translateY(-1px)'
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <CircularProgress size={24} thickness={4} color="error" />
                ) : (
                  <DeleteOutline />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
            startIcon={isDeleting ? <CircularProgress size={16} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default PostCard;