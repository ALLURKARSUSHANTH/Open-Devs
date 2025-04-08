import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  useMediaQuery,
  IconButton,
  Drawer,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from 'react-router-dom';

const CommentsSection = ({
  comments,
  commentText,
  setCommentText,
  handleCommentSubmit,
  replyText,
  setReplyText,
  replyInputVisible,
  toggleReplyInput,
  handleReplySubmit,
  viewReplies,
  toggleViewReplies,
  postId,
  mobileOpen,
  handleMobileClose,
  isLoading,
  error
}) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleOptimisticCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    const currentText = commentText;
    setCommentText(''); // Optimistically clear the input
    
    try {
      await handleCommentSubmit(postId);
      setSnackbarMessage('Comment posted successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setCommentText(currentText); // Restore text if submission fails
      setSnackbarMessage('Failed to post comment');
      setSnackbarOpen(true);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleOptimisticReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    const currentText = replyText;
    setReplyText(''); // Optimistically clear the input
    
    try {
      await handleReplySubmit(postId, commentId);
      setSnackbarMessage('Reply posted successfully!');
      setSnackbarOpen(true);
      toggleReplyInput(commentId);
    } catch (err) {
      setReplyText(currentText); // Restore text if submission fails
      setSnackbarMessage('Failed to post reply');
      setSnackbarOpen(true);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const content = (
    <Box sx={{ 
      height: isMobile ? 'auto' : '100%',
      overflowY: 'auto',
      p: 2,
      borderLeft: isMobile ? 'none' : '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '3px',
      }
    }}>
      {isMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          pt: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Comments ({comments.length})
          </Typography>
          <IconButton onClick={handleMobileClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {!isMobile && (
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontWeight: 'bold',
          color: 'text.primary',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          pt: 1
        }}>
          Comments ({comments.length})
        </Typography>
      )}

      {/* Comment input */}
      <Box sx={{ 
        mb: 3,
        position: 'sticky',
        top: isMobile ? 56 : 48,
        bgcolor: 'background.paper',
        zIndex: 1,
        pb: 1
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          sx={{ 
            mb: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: 'background.default'
            }
          }}
          size={isMobile ? 'small' : 'medium'}
          disabled={isSubmittingComment}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleOptimisticCommentSubmit}
            size={isMobile ? 'small' : 'medium'}
            endIcon={isSubmittingComment ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            disabled={!commentText.trim() || isSubmittingComment}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Post
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Comments list */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load comments
        </Alert>
      ) : (
        <Fade in={!isLoading} timeout={500}>
          <Box>
            {comments.map((comment) => (
              <Box 
                key={comment._id} 
                sx={{ mb: 3 }}
              >
                <Stack 
                  direction="row" 
                  spacing={1} 
                  alignItems="center" 
                  sx={{ 
                    mb: 1,
                    '&:hover': {
                      cursor: 'pointer'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const uid = comment.user?._id;
                    if (uid) {
                      navigate(`/profile/${uid}`);
                    }
                  }}
                >
                  <Avatar 
                    src={comment.user?.photoURL} 
                    sx={{ 
                      width: isMobile ? 28 : 32, 
                      height: isMobile ? 28 : 32,
                      cursor: 'pointer',
                      bgcolor: 'primary.main'
                    }}
                  />
                  <Typography 
                    variant={isMobile ? 'body2' : 'subtitle2'} 
                    sx={{ 
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    {comment.user?.displayName}
                  </Typography>
                </Stack>
                
                <Typography 
                  paragraph 
                  sx={{ 
                    mb: 1, 
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    color: 'text.secondary',
                    ml: isMobile ? 4 : 5
                  }}
                >
                  {comment.text}
                </Typography>

                {/* Reply functionality */}
                <Button
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => toggleReplyInput(comment._id)}
                  sx={{ 
                    mb: 1,
                    ml: isMobile ? 4 : 5,
                    color: 'text.secondary',
                    textTransform: 'none'
                  }}
                  startIcon={<ReplyIcon fontSize="small" />}
                >
                  Reply
                </Button>

                <Collapse in={replyInputVisible[comment._id]}>
                  <Box sx={{ ml: isMobile ? 6 : 8, mb: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder={`Reply to ${comment.user?.displayName}`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ 
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px',
                          bgcolor: 'background.default'
                        }
                      }}
                      disabled={isSubmittingReply}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size={isMobile ? 'small' : 'medium'}
                        onClick={() => handleOptimisticReplySubmit(comment._id)}
                        endIcon={isSubmittingReply ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                        disabled={!replyText.trim() || isSubmittingReply}
                        sx={{
                          borderRadius: '20px',
                          textTransform: 'none',
                          px: 3,
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: 'none'
                          }
                        }}
                      >
                        Post Reply
                      </Button>
                    </Box>
                  </Box>
                </Collapse>

                {/* Replies section */}
                {comment.replies?.length > 0 && (
                  <Box sx={{ ml: isMobile ? 4 : 6 }}>
                    <Button
                      size={isMobile ? 'small' : 'medium'}
                      onClick={() => toggleViewReplies(comment._id)}
                      sx={{ 
                        mb: 1,
                        color: 'text.secondary',
                        textTransform: 'none'
                      }}
                    >
                      {viewReplies[comment._id] ? 'Hide Replies' : `View Replies (${comment.replies.length})`}
                    </Button>

                    <Collapse in={viewReplies[comment._id]}>
                      {comment.replies.map((reply) => (
                        <Box 
                          key={reply._id} 
                          sx={{ 
                            mb: 2, 
                            ml: isMobile ? 1 : 2
                          }}
                        >
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            alignItems="center" 
                            sx={{ mb: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const uid = reply.user?._id;
                              if (uid) {
                                navigate(`/profile/${uid}`);
                              }
                            }}
                          >
                            <Avatar 
                              src={reply.user?.photoURL} 
                              sx={{ 
                                width: isMobile ? 20 : 24, 
                                height: isMobile ? 20 : 24,
                                cursor: 'pointer',
                                bgcolor: 'secondary.main'
                              }} 
                            />
                            <Typography 
                              variant={isMobile ? 'caption' : 'body2'}
                              sx={{
                                fontWeight: 500,
                                color: 'text.primary'
                              }}
                            >
                              {reply.user?.displayName}
                            </Typography>
                          </Stack>
                          <Typography 
                            variant={isMobile ? 'caption' : 'body2'} 
                            sx={{ 
                              color: 'text.secondary',
                              ml: isMobile ? 4 : 5
                            }}
                          >
                            {reply.text}
                          </Typography>
                        </Box>
                      ))}
                    </Collapse>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Box>
        </Fade>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          anchor="bottom"
          open={mobileOpen}
          onClose={handleMobileClose}
          sx={{
            '& .MuiDrawer-paper': {
              height: '80vh',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              overflow: 'hidden'
            },
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {content}
        </Drawer>
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      {content}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CommentsSection;