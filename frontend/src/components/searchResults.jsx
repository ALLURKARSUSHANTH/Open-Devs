import React from 'react';
import { Grid, Button, ListItem, ListItemText, Avatar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Box } from '@mui/system';

const SearchResults = ({ users, repos, showAll, onShowAllClick }) => {
  const renderUserResults = () => {
    return users.slice(0, showAll ? users.length : 5).map((user) => (
      <ListItem button key={user._id} component={Link} to={`/profile/${user._id}`}>
        <Avatar src={user.photoURL} alt={user.displayName} sx={{ marginRight: 2, width: 40, height: 40 }} />
        <ListItemText primary={user.displayName} secondary={user.email} />
      </ListItem>
    ));
  };

  const renderRepoResults = () => {
    return repos.slice(0, showAll ? repos.length : 5).map((repo) => (
      <ListItem button key={repo.id} component={Link} to={repo.html_url} target="_blank">
        <Avatar src={repo.owner.avatar_url} alt={repo.owner.login} sx={{ marginRight: 2, width: 40, height: 40 }} />
        <ListItemText primary={repo.name} secondary={repo.owner.login} />
      </ListItem>
    ));
  };

  return (
    <Box>
<Grid container columns={{ xs: 4, md: 12 }}>
<Grid item>
        <Typography>User results:</Typography>
        {renderUserResults()}
        </Grid>
        <Grid item>
        <Typography>Repo results:</Typography>
        {renderRepoResults()}
      </Grid>
    </Grid>
    {(users.length > 5 || repos.length > 5) && (
        <Button onClick={onShowAllClick} variant="outlined" sx={{ marginTop: 2 }}>
          {showAll ? 'Show Less Results' : 'Show All Results'}
        </Button>
      )}
      </Box>
  );
};

export default SearchResults;
