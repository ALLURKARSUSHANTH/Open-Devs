import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Link, 
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';
import GetPosts from '../components/Feed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ForkRightIcon from '@mui/icons-material/ForkRight';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({}); 
  const [showPost, setShowPost] = useState(false);

  const getLast24HoursDate = () => {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date.toISOString();
  };

  const ACCESS_TOKEN = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;
  const url = `https://api.github.com/search/repositories?q=pushed:>=${getLast24HoursDate()}`;

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
        setRepos(response.data.items.slice(0, 10)); // Limit to top 10 repos
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching repositories:", error);
        setError('Failed to fetch repositories');
        setLoading(false);
      });
  }, []);

  const truncateDescription = (description) => {
    const maxLength = isMobile ? 40 : 80; 
    if (description && description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description || 'No description available';
  };

  const handleToggleDescription = (repoId) => {
    setExpandedRepos((prevState) => ({
      ...prevState,
      [repoId]: !prevState[repoId], 
    }));
  };

  return (
    <Box sx={{ 
      borderRadius: '8px',
      color: 'white',
      backgroundColor: theme.palette.background.default,
      p: isMobile ? 1 : 3,
      maxWidth: '100%'
    }}>
      <GetPosts />
      
      <Divider sx={{ 
        my: 3,
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        '&:before, &:after': {
          borderColor: theme.palette.primary.main,
        }
      }}>
        <GitHubIcon sx={{ color: theme.palette.primary.main, mx: 2 }} />
      </Divider>

      <Typography 
        variant="h5" 
        align="start" 
        gutterBottom  
        sx={{ 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <StarIcon sx={{ mr: 1 }} />
        Trending GitHub Repositories
      </Typography>

      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px'
        }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {error && (
        <Typography 
          variant="body1" 
          color="error" 
          align="center" 
          sx={{ 
            p: 3,
            backgroundColor: theme.palette.error.background,
            borderRadius: '4px'
          }}
        >
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <Box sx={{ 
          display: 'flex', 
          overflowX: 'auto', 
          py: 2,
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '3px',
          }
        }}>
          {repos.map((repo) => {
            const isDescriptionExpanded = expandedRepos[repo.id] || false;
            const description = repo.description || 'No description available';
            const truncatedDescription = truncateDescription(description);

            return (
              <Box 
                key={repo.id} 
                sx={{ 
                  minWidth: isMobile ? 280 : 320, 
                  mx: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={repo.owner.avatar_url}
                    alt={repo.name}
                    sx={{
                      objectFit: 'cover',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      {repo.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        mb: 2,
                        minHeight: isDescriptionExpanded ? 'auto' : '60px'
                      }}
                    >
                      {isDescriptionExpanded ? description : truncatedDescription}
                    </Typography>
                    {description.length > 50 && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleToggleDescription(repo.id)}
                        endIcon={isDescriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                  </CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px'
                  }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Stars">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: theme.palette.text.secondary
                        }}>
                          <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            {repo.stargazers_count}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Forks">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: theme.palette.text.secondary
                        }}>
                          <ForkRightIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            {repo.forks_count}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Watchers">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: theme.palette.text.secondary
                        }}>
                          <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            {repo.watchers_count}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<GitHubIcon />}
                      sx={{ 
                        borderRadius: '20px',
                        textTransform: 'none',
                        px: 2,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: 'none'
                        }
                      }}
                    >
                      <Link 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener" 
                        underline="none"
                        sx={{ 
                          color: 'inherit',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        View
                      </Link>
                    </Button>
                  </Box>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Home;