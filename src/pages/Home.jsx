import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemText, Link } from '@mui/material';
import axios from 'axios';

const Home = () => {
  const [issues, setIssues] = useState([]);  
  const [loading, setLoading] = useState(true);  // State to track loading state
  const [error, setError] = useState(null);  // State to track errors

  // GitHub personal access token and API endpoint
  const ACCESS_TOKEN = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;
  const query = 'label:"good first issue" state:open';
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`;
  // Set up headers with authentication
  const headers = {
    'Authorization': `token ${ACCESS_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  // Fetch issues when the component is mounted
  useEffect(() => {
    axios
      .get(url, { headers })
      .then(response => {
        setIssues(response.data.items);  // Set the fetched issues to state
        setLoading(false); 
      })
      .catch(error => {
        setError('Failed to fetch issues');
        setLoading(false); 
      });
  }, []);

  return (
    <div>
      <Typography variant="h4">Home</Typography>

      {loading && <Typography variant="body1">Loading issues...</Typography>}

      {error && <Typography variant="body1" color="error">{error}</Typography>}

      {!loading && !error && (
        <List>
          {issues.map(issue => (
            <ListItem key={issue.id}>
              <ListItemText
                primary={issue.title}
                secondary={
                  <>
                    <Typography variant="body2">
                      Repository: {issue.repository_url.split('/').pop()}
                    </Typography>
                    <Link href={issue.html_url} target="_blank" rel="noopener">
                      View Issue
                    </Link>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default Home;
