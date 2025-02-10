import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import axios from "axios";
import { useTheme } from "../Theme/toggleTheme";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const GetPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid;
       setLoggedInUserId(uid);
    });

    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/posts/getPosts");
        const userResponse = await axios.get(`http://localhost:5000/users/firebase/${loggedInUserId}`);
        
        const followingList = userResponse.data.following; 
        
        const updatedPosts = response.data.map((post) => ({
          ...post,
          isFollowing: followingList.includes(post.author?._id),
        }));
  
        setPosts(updatedPosts);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching posts");
      } finally {
        setLoading(false);
      }
    };
  
    if (loggedInUserId) fetchPosts();
  }, [loggedInUserId]);
  

  const handleFollowToggle = async (authorId) => {
    if (!loggedInUserId) {
      alert("Please log in to follow users.");
      return;
    }
    console.log("Following/unfollowing user:", authorId);
    console.log("Logged in user:", loggedInUserId);
    try {
      const response = await axios.post(`http://localhost:5000/follow/${authorId}`, {
        userId: loggedInUserId,
      });
  
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.author?._id === authorId
            ? { ...post, isFollowing: !post.isFollowing }
            : post
        )
      );
  
      console.log(response.data.message);
    } catch (error) {
      console.error("Error updating follow status:", error);
      alert(error.response?.data?.message || "Failed to update follow status. Please try again.");
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, padding: "20px" }}>
      {posts.map((post) => (
        <Card
          key={post._id} {...post}
          sx={{
            display: "flex",
            flexDirection: "column",
            boxShadow: theme === "dark" ? "0px 6px 15px rgba(0, 0, 0, 0.3)" : "0px 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            background: theme === "dark" ? "#1c1c1c" : "linear-gradient(145deg, #f3f4f6, #e1e2e5)",
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: theme === "dark" ? "0px 6px 20px rgba(0, 0, 0, 0.4)" : "0px 6px 15px rgba(0, 0, 0, 0.2)",
            },
            padding: 2,
          }}
        >
          <CardContent sx={{ padding: "16px", position: "relative" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: theme === "dark" ? "#ffffff" : "#333" }}>
              {post.author?.displayName || "Unknown Author"}
            </Typography>
            <Typography color={theme === "dark" ? "text.secondary" : "text.primary"} sx={{ fontSize: "14px" }}>
              {post.content}
            </Typography>

            {/* Follow Button */}
            {post.author && post.author?._id !== loggedInUserId && (
              <Button
                variant="contained"
                color={post.isFollowing ? "error" : "primary"}
                size="small"
                sx={{ position: "absolute", top: 10, right: 10 }}
                onClick={() => handleFollowToggle(post.author._id)}
              >
                {post.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GetPosts;
