import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { skillsList } from '../services/Skills';
import axios from 'axios';
import {
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Box,
  useMediaQuery,
  CircularProgress,
  Modal,
  IconButton,
  Chip,
  Stack,
  Divider,
  Paper,
  Tooltip,
  Fade,
  Badge,
  Snackbar,
  Alert,
  Collapse
} from "@mui/material";
import { logout } from "../firebase/auth";
import {
  People as ConnectionsIcon,
  Favorite as FollowersIcon,
  PhotoLibrary as PostsIcon,
  Close as CloseIcon,
  Edit,
  Save,
  Logout,
  Add
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";                    
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import FollowersList from "../components/FollowersList";
import ConnectionsList from "../components/ConnectionsList";
import PostCard from "../components/PostsCard";
import CommentsSection from "../components/Comments";
import { fetchComments } from "../services/posts";
import usePostActions from "../components/postActions";
import { styled, useTheme } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const ProfileHeader = styled('div')(({ theme }) => ({
  height: 180,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #2c3e50, #4ca1af)'
    : 'linear-gradient(135deg, #6a11cb, #2575fc)',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  position: 'relative'
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginTop: -60,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.2s',
  borderRadius: 8,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)'
  }
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  margin: theme.spacing(0.5),
  '& .MuiChip-deleteIcon': {
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.error.main
    }
  }
}));

const Profile = () => {
  const { uid } = useParams();
  const mytheme = useTheme();
  const isMobile = useMediaQuery((mytheme.breakpoints.down("sm")));
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);
  const {
    theme,
    loading,
    error,
    loggedInUserId,
    selectedImages,
    isModalOpen,
    replyInputVisible,
    replyText,
    viewReplies,
    commentsDrawerOpen,
    commentText,
    expandedPosts,
    setLoading,
    setError,
    setCommentText,
    setReplyText,
    setCommentsDrawerOpen,
    toggleExpand,
    openModal,
    closeModal,
    handleLike,
    handleFollowToggle,
    handleConnectToggle,
    toggleCommentInput,
    handleCommentSubmit,
    toggleReplyInput,
    handleReplySubmit,
    toggleViewReplies,
  } = usePostActions(isMobile);

  const navigate = useNavigate();
  const profile = useSelector((state) => state.auth.profile);
  const [counts, setCounts] = useState({
    followers: 0,
    posts: 0,
    connections: 0,
  });
  const API_URL = import.meta.env.VITE_API_URL;

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: profile?.displayName || "User",
    email: profile?.email || "No email available",
    photoURL: profile?.photoURL || "",
    level: profile?.level || "Beginner",
    points: profile?.points || 0
  });
  const [followers, setFollowers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const currentUser = uid === loggedInUserId;

  useEffect(() => {
    const fetchCounts = async () => {
      if (!uid) return;
      try {
        setLoading(true);
        const profileRes = await axios.get(`${API_URL}/users/firebase/${uid}`);
        setProfileData((prev) => ({
          ...prev,
          displayName: profileRes.data.displayName,
          email: profileRes.data.email,
          photoURL: profileRes.data.photoURL,
          level: profileRes.data.level,
          points: profileRes.data.points,
        }));
        setSkills(profileRes.data.skills || []);

        const [followersRes, postsRes, connectionsRes] = await Promise.all([
          axios.get(`${API_URL}/follow/${uid}/followers-count`),
          axios.get(`${API_URL}/posts/getProfile/${uid}`),
          axios.get(`${API_URL}/connections/connected/${uid}`),
        ]);

        setFollowers(followersRes.data.followers || []);
        setPosts(postsRes.data.posts || []);
        setConnections(connectionsRes.data.connections || []);

        setCounts({
          followers: followersRes.data.followers?.length || 0,
          posts: postsRes.data.posts?.length || 0,
          connections: connectionsRes.data.connections?.length || 0,
        });

        const comments = {};
        for (const post of postsRes.data.posts || []) {
          const postComments = await fetchComments(post._id);
          comments[post._id] = postComments;
        }
        setPostComments(comments);
      } catch (err) {
        console.error("Error fetching counts:", err);
        setError(
          err.response?.data?.message ||
          "An error occurred while fetching data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [uid]);

  const handleDeletePost = async (postId) => {
    try {
      setDeletingPostId(postId);
      const postToDelete = posts.find(post => post._id === postId);
      
      // Optimistic UI update
      setPosts(prev => prev.filter(post => post._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }

      await axios.delete(`${API_URL}/posts/deletePost/${postId}`);
      setSelectedPost(null);
      
      setCounts(prev => ({
        ...prev,
        posts: prev.posts - 1
      }));
      
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError(error.response?.data?.message || "Failed to delete post");
      // Revert UI if API fails
      setPosts(prev => [...prev, posts.find(post => post._id === postId)]);
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleCloseDeleteError = () => {
    setDeleteError(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed", error);
      setError("Failed to logout");
    }
  };

  const handleRemoveFollower = useCallback((followerId) => {
    setFollowers((prevFollowers) =>
      prevFollowers.filter((follower) => follower._id !== followerId),
    );
    setCounts((prevCounts) => ({
      ...prevCounts,
      followers: prevCounts.followers - 1,
    }));
  }, []);

  const handleRemoveConnection = useCallback((connectionId) => {
    setConnections((prevConnections) =>
      prevConnections.filter((connection) => connection._id !== connectionId),
    );
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/users/update/${uid}`, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });
      if (skills.length > 0) {
        await axios.patch(`${API_URL}/users/skills/${uid}`, {
          skills: skills,
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile.");
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newPhotoURL = reader.result;
        setProfileData((prev) => ({ ...prev, photoURL: newPhotoURL }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setNewSkill(value);

    if (value.length > 0) {
      const matches = skillsList.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase())
      );
      setSkillSuggestions(matches);
    } else {
      setSkillSuggestions([]);
    }
  };

  const handleAddSkill = async (skill = null) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !skills.includes(skillToAdd)) {
      const updatedSkills = [...skills, skillToAdd];
      setSkills(updatedSkills);
      setNewSkill('');
      setSkillSuggestions([]);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
  };

  const handleOpenFollowersModal = () => setFollowersModalOpen(true);
  const handleCloseFollowersModal = () => setFollowersModalOpen(false);
  const handleOpenConnectionsModal = () => setConnectionsModalOpen(true);
  const handleCloseConnectionsModal = () => setConnectionsModalOpen(false);

  useEffect(() => {
    const loadComments = async () => {
      const comments = {};
      for (const post of posts) {
        const postComments = await fetchComments(post._id);
        comments[post._id] = postComments;
      }
      setPostComments(comments);
    };

    if (posts.length > 0) {
      loadComments();
    }
  }, [posts]);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        p: 3
      }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const ProfilePicModal = () => (
    <Modal open={profilePicModalOpen} onClose={() => setProfilePicModalOpen(false)}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.95)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <IconButton
          onClick={() => setProfilePicModalOpen(false)}
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            color: "white",
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>
        <Box
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img
            src={profileData.photoURL}
            alt={`${profileData.displayName}'s profile`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </Box>
      </Box>
    </Modal>
  );

  return (
    <Box sx={{ width: "100%", padding: isMobile ? 0 : 2 }}>
      <Grid container justifyContent="center" sx={{ mb: 4 }}>
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <StyledCard>
            <ProfileHeader />
            <CardContent>
              <Grid container direction="column" alignItems="center" spacing={2}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    currentUser && isEditing && (
                      <label htmlFor="avatar-upload">
                        <IconButton
                          component="span"
                          size="small"
                          sx={{
                            backgroundColor: mytheme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: mytheme.palette.primary.dark
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </label>
                    )
                  }
                >
                  <ProfileAvatar
                    src={profileData.photoURL}
                    alt={profileData.displayName}
                    onClick={() => profileData.photoURL && setProfilePicModalOpen(true)}
                  />
                </Badge>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                />

                {isEditing ? (
                  <Grid container spacing={3} sx={{ mt: 1, px: 2 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profileData.email}
                        disabled
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={newSkill}
                          onChange={handleSkillInputChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Add a skill"
                          variant="outlined"
                        />
                        <Button
                          variant="contained"
                          onClick={() => handleAddSkill()}
                          startIcon={<Add />}
                          disabled={!newSkill.trim()}
                          sx={{
                            minWidth: 'auto'
                          }}
                        >
                          Add
                        </Button>
                      </Box>

                      {skillSuggestions.length > 0 && (
                        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Suggestions:
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {skillSuggestions.slice(0, 5).map((skill) => (
                              <Chip
                                key={skill}
                                label={skill}
                                onClick={() => handleAddSkill(skill)}
                                icon={<Add fontSize="small" />}
                                size="small"
                                variant="outlined"
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: mytheme.palette.action.hover
                                  }
                                }}
                              />
                            ))}
                          </Stack>
                        </Paper>
                      )}

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {skills.map((skill) => (
                          <SkillChip
                            key={skill}
                            label={skill}
                            onDelete={() => handleRemoveSkill(skill)}
                            color="primary"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                      {profileData.displayName}
                    </Typography>
                    
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Chip
                        label={profileData.level}
                        color="secondary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${profileData.points} points`}
                        color="info"
                        size="small"
                      />
                    </Box>

                    {skills.length > 0 && (
                      <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          SKILLS
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                          {skills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              color='primary'
                              sx={{
                                borderRadius: '8px'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </>
                )}

                <Grid container justifyContent="center" spacing={3} sx={{ mt: 1 }}>
                  <Grid item>
                    <StatItem onClick={handleOpenConnectionsModal}>
                      <Typography variant="h6" fontWeight="bold">
                        {connections.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <ConnectionsIcon sx={{ mr: 0.5, fontSize: 16, color: mytheme.palette.primary.main }} />
                        Connections
                      </Typography>
                    </StatItem>
                  </Grid>
                  <Grid item>
                    <StatItem onClick={handleOpenFollowersModal}>
                      <Typography variant="h6" fontWeight="bold">
                        {followers.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <FollowersIcon sx={{ mr: 0.5, fontSize: 16, color: mytheme.palette.error.main }} />
                        Followers
                      </Typography>
                    </StatItem>
                  </Grid>
                  <Grid item>
                    <StatItem>
                      <Typography variant="h6" fontWeight="bold">
                        {posts.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <PostsIcon sx={{ mr: 0.5, fontSize: 16, color: mytheme.palette.success.main }} />
                        Posts
                      </Typography>
                    </StatItem>
                  </Grid>
                </Grid>

                <FollowersList
                  followers={followers}
                  open={followersModalOpen}
                  onClose={handleCloseFollowersModal}
                  onRemoveFollower={handleRemoveFollower}
                  loggedInUserId={loggedInUserId}
                  userId={uid}
                />
                <ConnectionsList
                  connections={connections}
                  open={connectionsModalOpen}
                  onClose={handleCloseConnectionsModal}
                  onRemoveConnection={handleRemoveConnection}
                  loggedInUserId={loggedInUserId}
                  userId={uid}
                />

                {currentUser && (
                  <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
                    <Grid item>
                      {isEditing ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSave}
                          startIcon={<Save />}
                          sx={{
                            borderRadius: '12px',
                            px: 3,
                            fontWeight: 600
                          }}
                        >
                          Save Profile
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => setIsEditing(true)}
                          startIcon={<Edit />}
                          sx={{
                            borderRadius: '12px',
                            px: 3,
                            fontWeight: 600
                          }}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLogout}
                        startIcon={<Logout />}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          fontWeight: 600
                        }}
                      >
                        Logout
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Posts section */}
        {/* Posts Section */}
      <Box sx={{ p: 2, paddingBottom: "95px" }}>
        {posts.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography>No posts available</Typography>
          </Box>
        ) : isMobile ? (
          <>
            <Stack spacing={3}>
              {posts.map((post) => (
                <Collapse in={post._id !== deletingPostId} key={post._id}>
                  <PostCard
                    post={post}
                    loggedInUserId={loggedInUserId}
                    handleLike={handleLike}
                    handleFollowToggle={handleFollowToggle}
                    handleConnectToggle={handleConnectToggle}
                    handleDelete={handleDeletePost}
                    toggleCommentInput={(postId) => {
                      setSelectedPost(posts.find(p => p._id === postId));
                      setCommentsDrawerOpen(true);
                    }}
                    expandedPosts={expandedPosts}
                    toggleExpand={toggleExpand}
                    openModal={openModal}
                    theme={theme}
                  />
                </Collapse>
              ))}
            </Stack>

            <CommentsSection
              comments={postComments[selectedPost?._id] || []}
              commentText={commentText}
              setCommentText={setCommentText}
              handleCommentSubmit={handleCommentSubmit}
              replyText={replyText}
              setReplyText={setReplyText}
              replyInputVisible={replyInputVisible}
              toggleReplyInput={toggleReplyInput}
              handleReplySubmit={handleReplySubmit}
              viewReplies={viewReplies}
              toggleViewReplies={toggleViewReplies}
              postId={selectedPost?._id}
              mobileOpen={commentsDrawerOpen}
              handleMobileClose={() => setCommentsDrawerOpen(false)}
            />
          </>
        ) : selectedPost ? (
          <Box>
            <Box sx={{ display: "flex", mb: 4 }}>
              <Box sx={{ flex: 2 }}>
                <Collapse in={selectedPost._id !== deletingPostId}>
                  <PostCard
                    post={selectedPost}
                    loggedInUserId={loggedInUserId}
                    onClick={() => setSelectedPost(null)}
                    toggleCommentInput={toggleCommentInput}
                    toggleExpand={toggleExpand}
                    expandedPosts={expandedPosts}
                    handleConnectToggle={handleConnectToggle}
                    handleFollowToggle={handleFollowToggle}
                    handleLike={handleLike}
                    handleDelete={handleDeletePost}
                    openModal={openModal}
                    theme={theme}
                    isExpanded
                  />
                </Collapse>
              </Box>

              <Box sx={{ flex: 1 }}>
                <CommentsSection
                  comments={postComments[selectedPost._id] || []}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleCommentSubmit={() => handleCommentSubmit(selectedPost._id)}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  replyInputVisible={replyInputVisible}
                  toggleReplyInput={toggleReplyInput}
                  handleReplySubmit={handleReplySubmit}
                  viewReplies={viewReplies}
                  toggleViewReplies={toggleViewReplies}
                  postId={selectedPost._id}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                More Posts
              </Typography>
              <Grid container spacing={2}>
                {posts
                  .filter((p) => p._id !== selectedPost._id)
                  .map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                      <Collapse in={post._id !== deletingPostId}>
                        <PostCard
                          post={post}
                          handleLike={handleLike}
                          onClick={() => setSelectedPost(post)}
                          loggedInUserId={loggedInUserId}
                          openModal={openModal}
                          handleDelete={handleDeletePost}
                          theme={theme}
                        />
                      </Collapse>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
                <Collapse in={post._id !== deletingPostId}>
                  <PostCard
                    post={post}
                    onClick={() => setSelectedPost(post)}
                    handleLike={handleLike}
                    loggedInUserId={loggedInUserId}
                    handleDelete={handleDeletePost}
                    openModal={openModal}
                    theme={theme}
                  />
                </Collapse>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Image modal */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300
          }}
        >
          <IconButton
            onClick={closeModal}
            sx={{ 
              position: "absolute", 
              top: 24, 
              right: 24, 
              color: "white",
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            style={{ 
              width: "90%", 
              height: "90%",
              borderRadius: '12px'
            }}
          >
            {selectedImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`Slide ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Modal>
      
      <ProfilePicModal />

      {/* Error Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{ 
            borderRadius: '12px',
            boxShadow: mytheme.shadows[4]
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!deleteError}
        autoHideDuration={6000}
        onClose={handleCloseDeleteError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseDeleteError} 
          severity="error"
          sx={{ 
            borderRadius: '12px',
            boxShadow: mytheme.shadows[4]
          }}
        >
          {deleteError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;