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

const Profile = () => {
  const { uid } = useParams();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
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

  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: profile?.displayName || "User",
    email: profile?.email || "No email available",
    photoURL: profile?.photoURL || "",
    level: profile?.level || "Beginner",
    points: profile?.points || 0,
    skills: profile?.skills || []
  });
  const [followers, setFollowers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // For post expansion and comments
  const [postComments, setPostComments] = useState({});

  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const currentUser = uid === loggedInUserId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!uid) return;
      try {
        setLoading(true);
        const profileRes = await axios.get(`${API_URL}/users/firebase/${uid}`);
        setProfileData({
          displayName: profileRes.data.displayName,
          email: profileRes.data.email,
          photoURL: profileRes.data.photoURL,
          level: profileRes.data.level,
          points: profileRes.data.points,
          skills: profileRes.data.skills || []
        });

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

        // Load comments for each post
        const comments = {};
        for (const post of postsRes.data.posts || []) {
          const postComments = await fetchComments(post._id);
          comments[post._id] = postComments;
        }
        setPostComments(comments);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(
          err.response?.data?.message ||
          "An error occurred while fetching data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [uid, API_URL]);

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
      setSelectedPost(null)
      
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
    setFollowers((prev) => prev.filter(f => f._id !== followerId));
    setCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
  }, []);

  const handleRemoveConnection = useCallback((connectionId) => {
    setConnections((prev) => prev.filter(c => c._id !== connectionId));
    setCounts(prev => ({ ...prev, connections: prev.connections - 1 }));
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/users/update/${uid}`, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        skills: profileData.skills
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile.");
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setProfileData(prev => ({ ...prev, photoURL: response.data.url }));
      } catch (error) {
        console.error("Error uploading photo:", error);
        setError("Failed to upload photo");
      }
    }
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setNewSkill(value);
    setSkillSuggestions(
      value.length > 0 
        ? skillsList.filter(skill =>
            skill.toLowerCase().includes(value.toLowerCase())
          ).slice(0, 10)
        : []
    );
  };

  const handleAddSkill = (skill = null) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !profileData.skills.includes(skillToAdd)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillToAdd]
      }));
      setNewSkill('');
      setSkillSuggestions([]);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
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

  const ProfilePicModal = () => (
    <Modal open={profilePicModalOpen} onClose={() => setProfilePicModalOpen(false)}>
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}>
        <IconButton
          onClick={() => setProfilePicModalOpen(false)}
          sx={{ 
            position: "absolute", 
            top: 16, 
            right: 16, 
            color: "white",
            zIndex: 1
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>
        <Box sx={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img
            src={profileData.photoURL}
            alt={`${profileData.displayName}'s profile`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>
    </Modal>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", padding: 0 }}>
      <Grid container justifyContent="center" spacing={2} sx={{ padding: 0 }}>
        <Grid item xs={12} sm={8} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
            <div style={{
              height: "150px",
              background: "linear-gradient(135deg, #6a11cb, #2575fc)",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }} />

            <CardContent>
              <Grid container direction="column" alignItems="center" spacing={2}>
                <Avatar
                  src={profileData.photoURL}
                  alt={profileData.displayName}
                  onClick={() => profileData.photoURL && setProfilePicModalOpen(true)}
                  sx={{
                    width: 120,
                    height: 120,
                    marginTop: "-60px",
                    border: "4px solid white",
                    boxShadow: 3,
                    cursor: profileData.photoURL ? 'pointer' : 'default',
                    '&:hover': {
                      opacity: profileData.photoURL ? 0.9 : 1
                    }
                  }}
                />

                {isEditing ? (
                  <Grid container direction="column" spacing={2} sx={{ width: "100%", mt: 2, pl: 2 }}>
                    <Grid item>
                      <TextField
                        label="Full Name"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item>
                      <TextField
                        label="Email"
                        value={profileData.email}
                        disabled
                        fullWidth
                        margin="normal"
                      />
                    </Grid>

                    <Grid item>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TextField
                          value={newSkill}
                          onChange={handleSkillInputChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Type to search skills"
                          size="small"
                          sx={{ flexGrow: 1 }}
                          fullWidth
                        />
                      </Box>

                      {skillSuggestions.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Suggested Skills
                          </Typography>
                          <Grid container spacing={1}>
                            {skillSuggestions.map((skill, index) => (
                              <Grid item key={index}>
                                <Button
                                  variant="outlined"
                                  onClick={() => handleAddSkill(skill)}
                                  sx={{
                                    textTransform: 'none',
                                    borderRadius: '20px',
                                    padding: '4px 12px',
                                    fontSize: '0.875rem',
                                    margin: '2px'
                                  }}
                                >
                                  + {skill}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {profileData.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => handleRemoveSkill(skill)}
                          />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="avatar-upload"
                        type="file"
                        onChange={handlePhotoUpload}
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          variant="contained"
                          component="span"
                          sx={{
                            backgroundColor: "#007bff",
                            color: "white",
                            textTransform: "none",
                            borderRadius: "20px",
                          }}
                        >
                          Change Profile Photo
                        </Button>
                      </label>
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
                      {profileData.displayName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profileData.email}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Level: {profileData.level} | Points: {profileData.points}
                    </Typography>
                    {profileData.skills.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {profileData.skills.map((skill, index) => (
                            <Chip key={index} label={skill} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </>
                )}

                <Grid container justifyContent="space-around" sx={{ mt: 3 }}>
                  <Grid item>
                    <Typography
                      variant="h6"
                      align="center"
                      onClick={handleOpenConnectionsModal}
                      sx={{ cursor: "pointer" }}
                    >
                      {connections.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                      onClick={handleOpenConnectionsModal}
                    >
                      <ConnectionsIcon sx={{ mr: 1, color: "#6a11cb" }} />
                      Connections
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="h6"
                      align="center"
                      onClick={handleOpenFollowersModal}
                      sx={{ cursor: "pointer" }}
                    >
                      {followers.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                      onClick={handleOpenFollowersModal}
                    >
                      <FollowersIcon sx={{ mr: 1, color: "#ff4081" }} />
                      Followers
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" align="center">
                      {posts.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <PostsIcon sx={{ mr: 1, color: "#4caf50" }} />
                      Posts
                    </Typography>
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
                  <Grid container justifyContent="center" spacing={2} sx={{ mt: 3 }}>
                    <Grid item>
                      <Button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        color="primary"
                        variant={isEditing ? "contained" : "outlined"}
                        sx={{ borderRadius: 20 }}
                      >
                        {isEditing ? "Save Profile" : "Edit Profile"}
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        onClick={handleLogout}
                        color="secondary"
                        variant="contained"
                        sx={{ borderRadius: 20 }}
                      >
                        Logout
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      {/* Image Modal */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <IconButton
            onClick={closeModal}
            sx={{ position: "absolute", top: 16, right: 16, color: "white" }}
          >
            <CloseIcon />
          </IconButton>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            style={{ width: "80%", height: "80%" }}
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
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!deleteError}
        autoHideDuration={6000}
        onClose={handleCloseDeleteError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseDeleteError} severity="error">
          {deleteError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;