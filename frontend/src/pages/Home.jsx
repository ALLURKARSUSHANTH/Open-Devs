import React, { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, CardMedia, Button, Link, CircularProgress } from '@mui/material';
import axios from 'axios';
const Home = () => {

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({}); 
  const [showPost, setShowPost] = useState(false);

  const ACCESS_TOKEN = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;
  const url = 'https://api.github.com/search/repositories?q=stars:%3E10000&sort=stars&order=desc';

  const headers = {
    'Authorization': `token ${ACCESS_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  const handleShowPost = () => {
    setShowPost(showPost => !showPost);
  };
  useEffect(() => {
    axios
      .get(url, { headers })
      .then((response) => {
        setRepos(response.data.items);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching repositories:", error);
        setError('Failed to fetch repositories');
        setLoading(false);
      });
  }, []);

  const truncateDescription = (description) => {
    const maxLength = 150; 
    if (description && description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description;
  };

  const handleToggleDescription = (repoId) => {
    setExpandedRepos((prevState) => ({
      ...prevState,
      [repoId]: !prevState[repoId], 
    }));
  };

  return (
    <div>
      <Typography variant="h4" align="start" gutterBottom  style={{ padding: '20px', fontWeight: 'bold' ,color: '#FF5733'}}>
        Popular Repositories :
      </Typography>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress />
        </div>
      )}

      {error && (
        <Typography variant="body1" color="error" align="center" style={{ padding: '20px' }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <Grid container spacing={4} justifyContent="center">
          {repos.map((repo) => {
            const isDescriptionExpanded = expandedRepos[repo.id] || false;
            const description = repo.description || 'No description available';
            const truncatedDescription = truncateDescription(description);

            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={repo.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={repo.owner.avatar_url}
                    alt={repo.name}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {repo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isDescriptionExpanded ? description : truncatedDescription}
                    </Typography>
                    {description.length > 150 && !isDescriptionExpanded && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleToggleDescription(repo.id)}
                      >
                        See More
                      </Button>
                    )}
                    {description.length > 150 && isDescriptionExpanded && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleToggleDescription(repo.id)}
                      >
                        See Less
                      </Button>
                    )}
                  </CardContent>
                  <Button size="small" color="primary">
                    <Link href={repo.html_url} target="_blank" rel="noopener">
                      View Repository
                    </Link>
                  </Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </div>
  );
};

export default Home;
