import React from 'react';
import {
  Typography,
  Avatar,
  Card,
  Grid,
  Modal,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

const ConnectionsList = ({ connections, open, onClose, onRemoveConnection }) => {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1300 }} // Ensure modal is on top
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
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
        {/* Close button at the top-right corner */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Connections
        </Typography>
        {connections.length === 0 ? (
          <Typography>No connections found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {connections.map((connection) => (
              <Grid item key={connection.id} xs={12}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                  <Avatar src={connection.photoURL} alt={connection.displayName} sx={{ mr: 2 }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {connection.displayName}
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
                    onClick={() => onRemoveConnection(connection.id)} // Call onRemoveConnection with connection ID
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
  );
};

export default ConnectionsList;