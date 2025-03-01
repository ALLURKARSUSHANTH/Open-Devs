import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button, Modal, IconButton, Avatar, Stack, Tooltip } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import { useTheme } from "../Theme/toggleTheme";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CloseIcon from "@mui/icons-material/Close";
import { FavoriteBorderOutlined, CommentOutlined, ShareOutlined, Favorite } from "@mui/icons-material";
import { fetchPosts, incrementLike, followUser, connectUser } from "../services/posts";

const GetPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoggedInUserId(user?.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loggedInUserId) return;
    const loadPosts = async () => {
      try {
        const postsData = await fetchPosts(loggedInUserId); // Using the service
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadPosts();
  }, [loggedInUserId]);
  

  const toggleExpand = (postId) => {
    setExpandedPosts((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const openModal = (images) => {
    setSelectedImages(images);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImages([]);
  };

  const handleLike = async (postId) => {
    try {
      await incrementLike(postId, loggedInUserId, posts, setPosts); // Using the service to handle like
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFollowToggle = async (authorId) => {
    if (!loggedInUserId) {
      alert("Please log in to follow users.");
      return;
    }

    try {
      const message = await followUser(authorId, loggedInUserId); // Using the service
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.author?._id === authorId
            ? { ...post, isFollowing: !post.isFollowing }
            : post
        )
      );
      console.log(message);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConnectToggle = async (authorId) => {
    if (!loggedInUserId) {
      alert("Please log in to connect with users.");
      return;
    }

    try {
      const message = await connectUser(authorId, loggedInUserId); // Using the service
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.author?._id === authorId
            ? { ...post, isConnected: true }
            : post
        )
      );
      console.log(message);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, padding: "20px" }}>
      {posts.map((post) => (
        <Card key={post._id} sx={{ padding: 2, borderRadius: "12px" }}>
          {post.author && post.author._id && post.author._id !== loggedInUserId && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
              <Stack direction={"row"} spacing={1}>
                <Button
                  variant="contained"
                  color={post.isFollowing ? "error" : "primary"}
                  size="small"
                  sx={{ borderRadius: '8px' }}
                  onClick={() => handleFollowToggle(post.author._id)}
                >
                  {post.isFollowing ? "Unfollow" : "Follow"}
                </Button>
                {!post.isConnected && (
                  <Button
                    variant="contained"
                    color={post.isConnected ? "success" : "secondary"}
                    size="small"
                    sx={{ borderRadius: '8px' }}
                    onClick={() => handleConnectToggle(post.author._id)}
                    disabled={post.isConnected}
                  >
                    Connect
                  </Button>
                )}
              </Stack>
            </Box>
          )}
          <CardContent>
            <Stack direction={"row"} spacing={1}>
              <Avatar
                src={post.author?.photoURL}
                alt={post.author?.displayName[0]}
                sx={{ width: 50, height: 50, cursor: "pointer" }}
              />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {post.author?.displayName || "Unknown Author"}
              </Typography>
            </Stack>
            <Typography>
              {expandedPosts[post._id] || post.content.length <= 50
                ? post.content
                : `${post.content.substring(0, 50)}...`}
            </Typography>
            {post.content.length > 50 && (
              <Button onClick={() => toggleExpand(post._id)} size="small">
                {expandedPosts[post._id] ? "See Less" : "See More"}
              </Button>
            )}
            {post.imgUrls.length > 0 && (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "400px",
                  height: "250px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => openModal(post.imgUrls)}
              >
                <img
                  src={post.imgUrls[0]}
                  alt="Post Image"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {post.imgUrls.length > 2 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: "0 0 0 8px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {post.imgUrls.length - 1}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>

          <Tooltip title="Like">
            <IconButton
              sx={{ padding: "8px 16px", paddingTop: "25px" }}
              onClick={() => handleLike(post._id)} // Call handleLike
            >
              {post.isLikedByUser ? (
                <Favorite sx={{ color: "red" }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
              <Typography>
                {post.likes.length || 0}
              </Typography>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", color: "gray" }}>
            <Typography variant="caption">
              {new Date(post.timeStamp).toLocaleString()}
            </Typography>
          </Box>
        </Card>
      ))}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          outline: "none",
        }}>
          <IconButton onClick={closeModal} sx={{ position: "absolute", top: 10, right: 10, color: "#fff" }}>
            <CloseIcon />
          </IconButton>
          <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} style={{ width: "80%", height: "100%" }}>
            {selectedImages.map((imgUrl, index) => (
              <SwiperSlide key={index}>
                <img src={imgUrl} alt={`${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Modal>
    </Box>
  );
};

export default GetPosts;
