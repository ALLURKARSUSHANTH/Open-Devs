import React from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  handleMobileClose
}) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const content = (
    <Box sx={{ 
      height: isMobile ? 'auto' : '100%',
      overflowY: 'auto',
      p: 2,
      borderLeft: isMobile ? 'none' : '1px solid',
      borderColor: 'divider'
    }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Comments ({comments.length})
          </Typography>
          <IconButton onClick={handleMobileClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {!isMobile && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Comments ({comments.length})
        </Typography>
      )}

      {/* Comment input */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          sx={{ mb: 1 }}
          size={isMobile ? 'small' : 'medium'}
        />
        <Button
          variant="contained"
          onClick={() => handleCommentSubmit(postId)}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
        >
          Post Comment
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Comments list */}
      {comments.map((comment) => (
        <Box key={comment._id} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            const uid = comment.user?._id;
            if (uid) {
              // Navigate to author's profile
              console.log(`Navigate to profile of ${uid}`);
              navigate(`/profile/${uid}`);
            }
          }} >
            <Avatar src={comment.user?.photoURL} sx={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32 ,cursor:"pointer"}}/>
            <Typography variant={isMobile ? 'body2' : 'subtitle2'}>
              {comment.user?.displayName}
            </Typography>
          </Stack>
          
          <Typography paragraph sx={{ mb: 1, fontSize: isMobile ? '0.875rem' : '1rem' }}>
            {comment.text}
          </Typography>

          {/* Reply functionality */}
          <Button
            size={isMobile ? 'small' : 'medium'}
            onClick={() => toggleReplyInput(comment._id)}
            sx={{ mb: 1 }}
          >
            Reply
          </Button>

          {replyInputVisible[comment._id] && (
            <Box sx={{ ml: isMobile ? 2 : 4, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={`Reply to ${comment.user?.displayName}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
                onClick={() => handleReplySubmit(postId, comment._id)}
                fullWidth={isMobile}
              >
                Post Reply
              </Button>
            </Box>
          )}

          {/* Replies section */}
          {comment.replies?.length > 0 && (
            <Box sx={{ ml: isMobile ? 2 : 4 }}>
              <Button
                size={isMobile ? 'small' : 'medium'}
                onClick={() => toggleViewReplies(comment._id)}
                sx={{ mb: 1 }}
              >
                {viewReplies[comment._id] ? 'Hide Replies' : `View Replies (${comment.replies.length})`}
              </Button>

              {viewReplies[comment._id] && comment.replies.map((reply) => (
                <Box key={reply._id} sx={{ mb: 2, ml: isMobile ? 1 : 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Avatar src={reply.user?.photoURL} sx={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24 }} />
                    <Typography variant={isMobile ? 'caption' : 'body2'}>
                      {reply.user?.displayName}
                    </Typography>
                  </Stack>
                  <Typography variant={isMobile ? 'caption' : 'body2'}>
                    {reply.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
        </Box>
      ))}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={handleMobileClose}
        sx={{
          '& .MuiDrawer-paper': {
            height: '80vh',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return content;
};

export default CommentsSection;