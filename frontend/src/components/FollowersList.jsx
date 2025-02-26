import React, { useState } from 'react';
import {
  Typography,
  Avatar,
  Card,
  Grid,
  Modal,
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FollowersList = ({ followers, open, onClose, onRemoveFollower }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFollowerId, setSelectedFollowerId] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleRemoveClick = (followerId) => {
    setSelectedFollowerId(followerId);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    setRemoving(true);
    await onRemoveFollower(selectedFollowerId);
    setRemoving(false);
    setConfirmOpen(false);
  };

  const handleCancelRemove = () => {
    setConfirmOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{ zIndex: 1300 }} // Ensure modal is on top
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            color: 'black',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper', // Ensure background color is set
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            zIndex: 1400, // Ensure content is on top
          }}
        >
          <Tooltip title="Close">
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Followers
          </Typography>
          {followers.length === 0 ? (
            <Typography>No followers found.</Typography>
          ) : (
            <Grid container spacing={2}>
              {followers.map((follower) => (
                <Grid item key={follower.id} xs={12}>
                  <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <Avatar src={follower.photoURL} alt={follower.displayName} sx={{ mr: 2 }} />
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {follower.displayName}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: 'lightgrey',
                        color: 'black',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'grey',
                        },
                      }}
                      size="small"
                      onClick={() => handleRemoveClick(follower.id)} // Open confirmation dialog
                    >
                      Remove
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelRemove}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this follower?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error" disabled={removing}>
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FollowersList;