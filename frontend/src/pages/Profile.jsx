import React, { useState, useEffect, useCallback } from "react"; //comments not being shown in mobile view
import { useSelector } from "react-redux";
import { Meta, useNavigate } from "react-router-dom";
import axios from "axios";
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

  useEffect(() => {
    const fetchCounts = async () => {
      if (!loggedInUserId) return;
      try {
        const [followersRes, postsRes, connectionsRes] = await Promise.all([
          axios.get(`${API_URL}/follow/${loggedInUserId}/followers-count`),
          axios.get(`${API_URL}/posts/getProfile/${loggedInUserId}`),
          axios.get(`${API_URL}/connections/connected/${loggedInUserId}`),
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
  }, [loggedInUserId]);

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
      await axios.put(`${API_URL}/${loggedInUserId}`, profileData);
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
          await axios.put(`${API_URL}/profile/${loggedInUserId}/photo`, {
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
                />
                <ConnectionsList
                  connections={connections}
                  open={connectionsModalOpen}
                  onClose={handleCloseConnectionsModal}
                  onRemoveConnection={handleRemoveConnection}
                  loggedInUserId={loggedInUserId}
                />

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
                  loggedInUserId={loggedInUserId}
                  handleLike={handleLike}
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
                  loggedInUserId={loggedInUserId}
                  onClick={() => setSelectedPost(null)}
                  toggleExpand={toggleExpand}
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
                        loggedInUserId={loggedInUserId}
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
                  loggedInUserId={loggedInUserId}
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
