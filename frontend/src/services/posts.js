import axios from 'axios';

// Base URL for API
const API_URL = 'http://localhost:5000';

export const createPost = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/posts/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
  } catch (error) {
    console.error("Error creating post:", error.response?.data || error.message);
  }
};

// Fetch posts for a specific user
export const fetchPosts = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/posts/getPosts/${userId}`);
    const userResponse = await axios.get(`${API_URL}/users/firebase/${userId}`);
    const followingList = userResponse.data.following;
    const connectionsList = userResponse.data.connections;

    return response.data.map((post) => ({
      ...post,
      isFollowing: followingList.includes(post.author?._id),
      isConnected: connectionsList.includes(post.author?._id), 
      isLikedByUser: post.likes.includes(userId),
    }));
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error fetching posts');
  }
};

// Increment likes for a post
export const incrementLike = async (postId, loggedInUserId, posts, setPosts) => {
  const updatedPosts = [...posts];
  try {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLikedByUser: !post.isLikedByUser, // Toggle like status
              likes: post.isLikedByUser ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    const response = await axios.post(`${API_URL}/posts/pushLikes/${postId}`, {
      userId: loggedInUserId,
    });

    console.log(response.data.message);
  } catch (error) {
    console.error("Error updating like status:", error);
    alert(error.response?.data?.message || "Failed to update like status. Please try again.");
    setPosts(updatedPosts); // Restore the previous state
  }
};

// Follow a user
export const followUser = async (authorId, userId) => {
  try {
    const response = await axios.post(`${API_URL}/follow/${authorId}`, {
      userId,
    });
    return response.data.message;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update follow status');
  }
};

// Connect with a user
export const connectUser = async (authorId, userId) => {
  try {
    const response = await axios.post(`${API_URL}/connections/connect/${authorId}`, {
      senderId: userId,
    });
    return response.data.message;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create connection');
  }
};

// Add a comment to a post
export const addComment = async (postId, comment, authorId) => {
  try {
    const response = await axios.post(`${API_URL}/posts/addComment/${postId}`, {
      user: authorId,
      text: comment,
    });
    console.log(response.data.message);
  } catch (error) {
    console.error("Error adding comment:", error);
    alert(error.response?.data?.message || "Failed to add comment. Please try again.");
  }
}

// Fetch comments for a post
export const fetchComments = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/posts/getComments/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

// Add a reply to a comment
export const addReply = async (postId, commentId, reply, authorId) => {
  try{
    const response = await axios.post(`${API_URL}/posts/addReply/${postId}/${commentId}`, {
      user: authorId,
      text: reply,
    });
    console.log(response.data.message);
  }
  catch (error) {
    console.error("Error adding reply:", error);
    alert(error.response?.data?.message || "Failed to add reply. Please try again.");
  }
};