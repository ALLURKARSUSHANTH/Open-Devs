import React, { useState } from 'react';
import { Typography, List, ListItem, ListItemText, CircularProgress, Box, Avatar } from '@mui/material';
//still working
const Mentor = () => {

  return (
    <div>
      <Typography variant="h6">Mentor Dashboard</Typography>

      {/* Display mentees list */}
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <List>
          {menteeData.length === 0 ? (
            <Typography>No mentees available</Typography>
          ) : (
            menteeData.map((mentee) => (
              <ListItem key={mentee._id}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  {mentee.displayName[0]}
                </Avatar>
                <ListItemText
                  primary={mentee.displayName}
                  secondary={`Email: ${mentee.email}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </div>
  );
};

export default Mentor;