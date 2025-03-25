import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  IconButton,
  Avatar,
  Stack,
  Tooltip,
  TextField,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTheme } from "../Theme/toggleTheme";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CloseIcon from "@mui/icons-material/Close";
import {
  FavoriteBorderOutlined,
  CommentOutlined,
  ShareOutlined,
  Favorite,
} from "@mui/icons-material";
import {
  fetchPosts,
  incrementLike,
  followUser,
  connectUser,
  addComment,
  fetchComments,
  addReply,
} from "../services/posts";

const GetPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [commentInputVisible, setCommentInputVisible] = useState({});
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState({});
  const [replyInputVisible, setReplyInputVisible] = useState({});
  const [replyText, setReplyText] = useState("");
  const [viewReplies, setViewReplies] = useState({});

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
        const postsData = await fetchPosts(loggedInUserId);
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
      await incrementLike(postId, loggedInUserId, posts, setPosts);
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
      const message = await followUser(authorId, loggedInUserId);
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
      const message = await connectUser(authorId, loggedInUserId);
      console.log(message);
      const updatedPosts = posts.map((post) =>
        post.author?._id === authorId
          ? { ...post, isConnected: true }
          : post
      );
      setPosts(updatedPosts);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleCommentInput = (postId) => {
    setCommentInputVisible((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;

    try {
      await addComment(postId, commentText, loggedInUserId);
      const updatedComments = await fetchComments(postId);
      setPostComments((prevState) => ({
        ...prevState,
        [postId]: updatedComments,
      }));
      setCommentText("");
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleReplyInput = (commentId) => {
    setReplyInputVisible((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleReplySubmit = async (postId, commentId) => {
    if (!replyText.trim()) return;

    try {
      await addReply(postId, commentId, replyText, loggedInUserId);
      const updatedComments = await fetchComments(postId);
      setPostComments((prevState) => ({
        ...prevState,
        [postId]: updatedComments,
      }));
      setReplyText("");
      setReplyInputVisible({});
    } catch (err) {
      alert(err.message);
    }
  };
  
 const toggleViewReplies = (commentId) => {
  setViewReplies((prevState) => ({
    ...prevState,
    [commentId]: !prevState[commentId], 
  }));
};

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
                  color={post.isFollowing ? "error" : "primary"}
                  size="small"
                  sx={{ borderRadius: "8px" }}
                  onClick={() => handleFollowToggle(post.author._id)}
                >
                  {post.isFollowing ? "Unfollow" : "Follow"}
                </Button>
                {!post.isConnected && (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    sx={{ borderRadius: "8px" }}
                    onClick={() => handleConnectToggle(post.author._id)}
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
            <Typography color={theme === "dark" ? "text.secondary" : "text.primary"} sx={{ fontSize: "14px" }}>
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
              onClick={() => handleLike(post._id)}
            >
              {post.isLikedByUser ? (
                <Favorite sx={{ color: "red" }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
              <Typography>{post.likes.length || 0}</Typography>
            </IconButton>
          </Tooltip>

          <Tooltip title="Comment">
            <IconButton
              sx={{ padding: "8px 16px", paddingTop: "25px" }}
              onClick={() => toggleCommentInput(post._id)}
            >
              <CommentOutlined />
              <Typography>{post.comments.length || 0}</Typography>
            </IconButton>
          </Tooltip>

          {commentInputVisible[post._id] && (
            <Stack direction={"column"} spacing={1}>
              <Box sx={{ display: "flex", gap: 1, padding: "8px 16px" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => handleCommentSubmit(post._id)}
                >
                  Post
                </Button>
              </Box>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Comments
                </Typography>
                {postComments[post._id]?.map((comment) => (
                  <Box key={comment._id} sx={{ marginTop: 1 }}>
                    <Stack direction={"row"} spacing={1}>
                      <Avatar
                        src={comment.user?.photoURL}
                        alt={comment.user?.displayName[0]}
                        sx={{ width: 20, height: 20, cursor: "pointer" }}
                      />
                      <Typography>
                        {comment.user?.displayName || "Unknown User"}
                      </Typography>
                    </Stack>
                    <Typography color="textSecondary">{comment.text}</Typography>
                    <Button
                      variant="text"
                      onClick={() => toggleReplyInput(comment._id)}
                    >
                      Reply
                    </Button>
                    {replyInputVisible[comment._id] && (
                      <Box sx={{ display: "flex", gap: 1, padding: "8px 16px" }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder={`Reply to ${comment.user?.displayName}`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => handleReplySubmit(post._id, comment._id)}
                        >
                          Post
                        </Button>
                      </Box>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <Button onClick={() => toggleViewReplies(comment._id)}>
                        {viewReplies[comment._id] ? "Hide Replies" : "View Replies"}
                      </Button>
                    )}
                    {viewReplies[comment._id] && comment.replies && comment.replies.map((reply) => (
                      <Box key={reply._id} sx={{ marginLeft: 10 }}>
                        <Stack direction={"row"} spacing={1}>
                          <Avatar
                            src={reply.user?.photoURL}
                            alt={reply.user?.displayName[0]}
                            sx={{ width: 20, height: 20, cursor: "pointer" }}
                          />
                          <Typography>
                            {reply.user?.displayName || "Unknown User"}
                          </Typography>
                        </Stack>
                        <Typography color="textSecondary">{reply.text}</Typography>
                      </Box>
                    ))}
                  
                  </Box>
                ))}
              </Box>
            </Stack>
          )}
          <Box sx={{ display: "flex", padding: "8px 16px", color: "gray" }}>
            <Typography variant="caption">
              {new Date(post.timeStamp).toLocaleString()}
            </Typography>
          </Box>
        </Card>
      ))}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
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
          }}
        >
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