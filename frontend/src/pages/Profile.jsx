import React, { useState, useEffect, useCallback } from 'react'; //comments not being shown in mobile view
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
} from "@mui/material";
import { logout } from "../firebase/auth";
import {
  People as ConnectionsIcon,
  Favorite as FollowersIcon,
  PhotoLibrary as PostsIcon,
  Close as CloseIcon,
  ImportantDevices,
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
  const {uid} = useParams();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
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
    mobileNumber: profile?.mobileNumber || "",
    photoURL: profile?.photoURL || "",
  });
  const [followers, setFollowers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // For post expansion and comments
  const [postComments, setPostComments] = useState({});

  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const currentUser = uid ===loggedInUserId;

  useEffect(() => {
    const fetchCounts = async () => {
      if (!uid) return;
      try {

        const profileRes = await axios.get(`${API_URL}/users/firebase/${uid}`);
        setProfileData((prev) => ({
          ...prev,
          displayName: profileRes.data.displayName,
          email: profileRes.data.email,
          mobileNumber: profileRes.data.mobileNumber,
          photoURL: profileRes.data.photoURL,
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

        // Load comments for each post
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
      }
    };

    fetchCounts();
  }, [uid]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed", error);
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
      await axios.put(`${API_URL}/users/firebase/${uid}`, {
        ...profileData,
        skills,
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newPhotoURL = reader.result;
        setProfileData((prev) => ({ ...prev, photoURL: newPhotoURL }));

        try {
          await axios.put(`${API_URL}/users/firbase/${uid}/photo`, {
            photoURL: newPhotoURL,
          });
        } catch (error) {
          console.error("Error updating photo:", error);
          setError("Failed to update photo.");
        }
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
      try {
        // Update local state immediately for better UX
        const updatedSkills = [...skills, skillToAdd];
        setSkills(updatedSkills);
        setNewSkill('');
        setSkillSuggestions([]);
        
        // Send the update to the backend
        await axios.patch(`${API_URL}/users/skills/${uid}`, {
          skills: updatedSkills
        });
      } catch (error) {
        console.error('Error updating skills:', error);
        // Revert local state if API call fails
        setSkills(skills);
        setError('Failed to update skills.');
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      // Update local state immediately for better UX
      const updatedSkills = skills.filter(skill => skill !== skillToRemove);
      setSkills(updatedSkills);
      
      // Send the update to the backend
      await axios.patch(`${API_URL}/users/skills/${uid}`, {
        skills: updatedSkills
      });
    } catch (error) {
      console.error('Error removing skill:', error);
      // Revert local state if API call fails
      setSkills(skills);
      setError('Failed to remove skill.');
    }
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
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box sx={{ color: "error.main", p: 2 }}>Error: {error}</Box>;
  }

  return (
    <Box sx={{ width: "100%", padding: 0 }}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ padding: 0 }}
      >
        <Grid item xs={12} sm={8} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
            <div
              style={{
                height: "150px",
                background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            />

            <CardContent>
              <Grid
                container
                direction="column"
                alignItems="center"
                spacing={2}
              >
                <Avatar
                  src={profileData.photoURL}
                  alt={profileData.displayName}
                  sx={{
                    width: 120,
                    height: 120,
                    marginTop: "-60px",
                    border: "4px solid white",
                    boxShadow: 3,
                  }}
                />

                {isEditing ? (
                  <Grid
                    container
                    direction="column"
                    spacing={2}
                    sx={{ width: "100%", marginTop: 2, paddingLeft: 2 }}
                  >
                    <Grid item>
                      <TextField
                        label="Full Name"
                        value={profileData.displayName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="Email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        fullWidth
                        margin="normal"
                        disabled
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            color: "#000000",
                            WebkitTextFillColor: "#000000",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="Mobile Number"
                        value={profileData.mobileNumber}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            mobileNumber: e.target.value,
                          }))
                        }
                        fullWidth
                        margin="normal"
                      />
                    </Grid>

                    {/* Skills Section */}
                    <Grid item>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                        Skills
                      </Typography>

                      <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        Enter a skill
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
                        <TextField
                          value={newSkill}
                          onChange={handleSkillInputChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Type to search skills"
                          size="small"
                          sx={{ flexGrow: 1 }}
                          fullWidth
                        />
                        <Button
                          variant="contained"
                          onClick={() => handleAddSkill()}
                          size="small"
                          sx={{ borderRadius: '4px' }}
                        >
                          Add
                        </Button>
                      </Box>

                      {skillSuggestions.length > 0 && (
                        <Box sx={{ marginBottom: 2 }}>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            Skill suggestions
                          </Typography>
                          <Grid container spacing={1}>
                            {skillSuggestions.slice(0, 10).map((skill, index) => (
                              <Grid item key={index}>
                                <Button
                                  variant="outlined"
                                  onClick={() => handleAddSkill(skill)}
                                  sx={{
                                    textTransform: 'none',
                                    borderRadius: '20px',
                                    padding: '4px 12px',
                                    fontSize: '0.875rem',
                                    margin: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span style={{ fontSize: '1rem' }}>+</span> {skill}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => handleRemoveSkill(skill)}
                            sx={{
                              backgroundColor: '#e3f2fd',
                              '& .MuiChip-deleteIcon': {
                                color: '#1976d2'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item>
                      <Card
                        sx={{
                          borderRadius: 4,
                          boxShadow: 6,
                          background: "lightgray",
                        }}
                      >
                        <CardContent>
                          <Grid
                            container
                            alignItems="center"
                            spacing={2}
                            justifyContent="space-between"
                          >
                            <Grid item>
                              <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                  <Avatar
                                    src={profileData.photoURL}
                                    alt={profileData.displayName}
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      border: "2px solid black",
                                    }}
                                  />
                                </Grid>
                                <Grid item>
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {profileData.displayName}
                                  </Typography>
                                </Grid>
                              </Grid>
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
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                  }}
                                >
                                  Change photo
                                </Button>
                              </label>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ marginTop: 2, fontWeight: "bold" }}
                    >
                      {profileData.displayName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profileData.email}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profileData.mobileNumber || "No mobile number available"}
                    </Typography>
                    {skills.length > 0 && (
                      <Box sx={{ marginTop: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}>
                          {skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              sx={{     backgroundColor: theme === 'dark' ? '#1c1c1c' : '#ffffff', // Add background color
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </>
                )}

                <Grid
                  container
                  justifyContent="space-around"
                  sx={{ marginTop: 3 }}
                >
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
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={handleOpenConnectionsModal}
                    >
                      <ConnectionsIcon
                        sx={{ marginRight: 1, color: "#6a11cb" }}
                      />{" "}
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
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={handleOpenFollowersModal}
                    >
                      <FollowersIcon
                        sx={{ marginRight: 1, color: "#ff4081" }}
                      />{" "}
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
                      <PostsIcon sx={{ marginRight: 1, color: "#4caf50" }} />{" "}
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
                  userId ={uid}
                />
                <ConnectionsList
                  connections={connections}
                  open={connectionsModalOpen}
                  onClose={handleCloseConnectionsModal}
                  onRemoveConnection={handleRemoveConnection}
                  loggedInUserId={loggedInUserId}
                  userId ={uid}
                />

                {currentUser ? (
                <Grid
                  container
                  justifyContent="center"
                  spacing={2}
                  sx={{ marginTop: 3 }}
                >
                 
                  <Grid item>
                    {isEditing ? (
                      <Button
                        onClick={handleSave}
                        color="primary"
                        variant="contained"
                        sx={{ borderRadius: 20 }}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 20 }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Grid>
                  
                  <Grid item>
                    <Button
                      onClick={handleLogout}
                      color="secondary"
                      variant="contained"
                      sx={{ borderRadius: 20 }}
                    >
                      LogOut
                    </Button>
                  </Grid>
                </Grid>
                ): null}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Posts section */}
      <Box sx={{ p: 2, paddingBottom: "95px" }}>
        {posts.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography>No posts available</Typography>
          </Box>
        ) : isMobile ? (
          // Mobile view - single column with comments drawer
          <>
            <Stack spacing={3}>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  loggedInUserId={uid}
                  handleLike={handleLike}
                  handleFollowToggle={handleFollowToggle}
                  handleConnectToggle={handleConnectToggle}
                  toggleCommentInput={(postId) => {
                    setSelectedPost(posts.find(p => p._id === postId));
                    setCommentsDrawerOpen(true);
                  }}
                  toggleExpand={toggleExpand}
                  openModal={openModal}
                  theme={theme}
                />
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
          // Desktop expanded view with comments on right and posts below
          <Box>
            <Box sx={{ display: "flex", mb: 4 }}>
              <Box sx={{ flex: 2 }}>
                <PostCard
                  post={selectedPost}
                  loggedInUserId={uid}
                  onClick={() => setSelectedPost(null)}
                  toggleExpand={toggleExpand}
                  handleConnectToggle={handleConnectToggle}
                  handleFollowToggle={handleFollowToggle}
                  handleLike={handleLike}
                  openModal={openModal}
                  theme={theme}
                  isExpanded
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <CommentsSection
                  comments={postComments[selectedPost._id] || []}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleCommentSubmit={() =>
                    handleCommentSubmit(selectedPost._id)
                  }
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
                      <PostCard
                        post={post}
                        handleLike={handleLike}
                        onClick={() => setSelectedPost(post)}
                        loggedInUserId={uid}
                        openModal={openModal}
                        theme={theme}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </Box>
        ) : (
          // Desktop grid view
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
                <PostCard
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  handleLike={handleLike}
                  loggedInUserId={uid}
                  openModal={openModal}
                />
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
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
    </Box>
  );
};

export default Profile;
