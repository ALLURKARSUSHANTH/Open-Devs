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
  Alert,
  Collapse,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem
} from '@mui/material';
import {
  FavoriteBorderOutlined,
  CommentOutlined,
  Favorite,
  DeleteOutline,
  MoreVert,
  PersonAdd,
  Link,
  ExpandMore,
  ExpandLess,
  Share
} from '@mui/icons-material';
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const PostImage = styled('div')(({ theme }) => ({
  position: "relative",
  width: "100%",
  borderRadius: 8,
  overflow: "hidden",
  cursor: "pointer",
  marginBottom: theme.spacing(2),
  '& img': {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: 'transform 0.3s ease'
  },
  '&:hover img': {
    transform: 'scale(1.02)'
  }
}));

const PostCard = ({ 
  post, 
  isExpanded = false,
  expandedPosts = {},
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
  const [isDeleted, setIsDeleted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
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
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setIsDeleting(true);
    try {
      await handleDelete(post._id);
      setIsDeleted(true);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError('Failed to delete post');
      setIsDeleted(false);
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

  const handleShare = (e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author?.displayName || 'User'}`,
        text: post.content.length > 50 
          ? `${post.content.substring(0, 50)}...` 
          : post.content,
        url: postUrl,
      }).catch(() => {
        copyToClipboard(postUrl);
      });
    } else {
      copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      })
      .catch(() => {
        setError('Failed to copy link');
      });
  };

  if (isDeleted) return null;

  return (
    <Collapse in={!isDeleted}>
      <StyledCard onClick={!isExpanded ? onClick : undefined}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Header with author info and actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Stack 
              direction="row" 
              spacing={1.5} 
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
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {post.author?.displayName || "Unknown Author"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.timeStamp).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>

            <Box>
              {!isAuthor && post.author?._id && (
                <Stack direction="row" spacing={1}>
                  <Tooltip title={localState.isFollowing ? "Unfollow" : "Follow"}>
                    <Button
                      size="small"
                      variant={localState.isFollowing ? "contained" : "outlined"}
                      color={localState.isFollowing ? "error" : "primary"}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 0,
                        px: 1.5,
                        fontSize: '0.75rem'
                      }}
                      onClick={(e) => handleOptimisticFollow(e, post.author._id)}
                      disabled={localState.isConnecting}
                      startIcon={
                        localState.isFollowing ? (
                          <Favorite fontSize="small" />
                        ) : (
                          <PersonAdd fontSize="small" />
                        )
                      }
                    >
                      {isMobile ? '' : localState.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </Tooltip>

                  {!localState.isConnected && (
                    <Tooltip title={localState.isConnecting ? "Connecting..." : "Connect"}>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          minWidth: 0,
                          px: 1.5,
                          fontSize: '0.75rem'
                        }}
                        onClick={(e) => handleOptimisticConnect(e, post.author._id)}
                        disabled={localState.isConnecting}
                        startIcon={
                          localState.isConnecting ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Link fontSize="small" />
                          )
                        }
                      >
                        {isMobile ? '' : localState.isConnecting ? '...' : 'Connect'}
                      </Button>
                    </Tooltip>
                  )}
                </Stack>
              )}

              {isAuthor && (
                <>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                      <DeleteOutline sx={{ mr: 1 }} />
                      Delete Post
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          {/* Post Content */}
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ 
              mb: 2,
              whiteSpace: 'pre-line',
              lineHeight: 1.6,
              color: 'text.primary'
            }}
          >
            {expandedPosts[post._id] || post.content.length <= 100
              ? post.content
              : `${post.content.substring(0, 100)}...`}
            {post.content.length > 100 && (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(post._id);
                }}
                sx={{ 
                  ml: 1,
                  color: 'primary.main',
                  textTransform: 'none',
                  minWidth: 0,
                  fontWeight: 'bold'
                }}
                endIcon={expandedPosts[post._id] ? <ExpandLess /> : <ExpandMore />}
              >
                {expandedPosts[post._id] ? "Show less" : "Show more"}
              </Button>
            )}
          </Typography>

          {/* Images */}
          {post.imgUrls?.length > 0 && (
            <PostImage
              onClick={(e) => {
                e.stopPropagation();
                openModal(post.imgUrls);
              }}
              sx={{ height: isExpanded ? (isMobile ? 200 : 400) : (isMobile ? 150 : 250) }}
            >
              <img
                src={post.imgUrls[0]}
                alt="Post"
              />
              {post.imgUrls.length > 1 && (
                <Chip
                  label={`+${post.imgUrls.length - 1}`}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: "#fff"
                  }}
                />
              )}
            </PostImage>
          )}

          {/* Code Snippet */}
          {post.codeSnippet && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Code Snippet
              </Typography>
              {editorLoaded || isExpanded ? (
                <Box sx={{ 
                  border: `1px solid ${muiTheme.palette.divider}`,
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <MonacoEditor
                    height={isExpanded ? (isMobile ? 200 : 300) : (isMobile ? 120 : 200)}
                    language={post.codeLanguage || "javascript"}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    value={post.codeSnippet}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: isMobile ? 12 : 14,
                      lineNumbers: 'off'
                    }}
                    loading={<CircularProgress size={24} />}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: isMobile ? 80 : 100,
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: `1px dashed ${muiTheme.palette.divider}`,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => setEditorLoaded(true)}
                >
                  <Typography variant="body2" color="text.secondary">
                    Click to view code
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Actions */}
          {showActions && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title={localState.isLiked ? "Unlike" : "Like"}>
                    <Button
                      startIcon={
                        localState.isLiked ? (
                          <Favorite sx={{ color: muiTheme.palette.error.main }} />
                        ) : (
                          <FavoriteBorderOutlined />
                        )
                      }
                      onClick={(e) => handleOptimisticLike(e, post._id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {localState.likeCount} {isMobile ? '' : 'Likes'}
                    </Button>
                  </Tooltip>

                  <Tooltip title="Add comment">
                    <Button
                      startIcon={<CommentOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCommentInput(post._id);
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {post.comments?.length || 0} {isMobile ? '' : 'Comments'}
                    </Button>
                  </Tooltip>

                  <Tooltip title="Share post">
                    <Button
                      startIcon={<Share />}
                      onClick={handleShare}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {isMobile ? '' : 'Share'}
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </>
          )}
        </CardContent>

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

        {/* Copied to clipboard notification */}
        <Snackbar
          open={showCopied}
          autoHideDuration={2000}
          onClose={() => setShowCopied(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </StyledCard>
    </Collapse>
  );
};

export default PostCard;