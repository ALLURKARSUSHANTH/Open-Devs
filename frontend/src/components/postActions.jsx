import { useState, useEffect } from "react";
import { useTheme } from "../Theme/toggleTheme";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchPosts,
  incrementLike,
  followUser,
  connectUser,
  addComment,
  fetchComments,
  addReply,
} from "../services/posts";
import socket from "../context/socket";

const usePostActions = (isMobile) => {  // Add isMobile as parameter
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
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);

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
      const updatedPost = posts.find((post) => post.author?._id === authorId);
      if (!updatedPost?.isFollowing) {
        socket.emit("follow", {
          userId: loggedInUserId,
          followUserId: authorId,
        });
      } else {
        socket.emit("unfollow", {
          userId: loggedInUserId,
          followUserId: authorId,
        });
      }
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
    if (isMobile) {
      setSelectedPost(posts.find(post => post._id === postId));
      setCommentsDrawerOpen(true);
    } else {
      setCommentInputVisible((prevState) => ({
        ...prevState,
        [postId]: !prevState[postId],
      }));
    }
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

  return {
    // State
    posts,
    loading,
    error,
    theme,
    loggedInUserId,  // Make sure this is included
    selectedImages,
    isModalOpen,
    expandedPosts,
    commentInputVisible,
    commentText,
    postComments,
    replyInputVisible,
    replyText,
    viewReplies,
    selectedPost,
    commentsDrawerOpen,
    
    // Setters
    setCommentText,
    setReplyText,
    setSelectedPost,
    setCommentsDrawerOpen,
    setLoading,
    setError,
    
    // Actions
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
    toggleViewReplies
  };
};

export default usePostActions;