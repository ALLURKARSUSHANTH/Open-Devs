import React from "react";
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Stack,
  Grid,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CloseIcon from "@mui/icons-material/Close";
import PostCard from "./PostsCard";
import CommentsSection from "./Comments";
import usePostActions from "./postActions";

const GetPosts = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const {
    posts,
    loading,
    error,
    theme,
    loggedInUserId,
    selectedImages,
    isModalOpen,
    postComments,
    replyInputVisible,
    replyText,
    viewReplies,
    selectedPost,
    commentsDrawerOpen,
    commentText,
    setCommentText,
    setReplyText,
    setSelectedPost,
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
    toggleViewReplies
  } = usePostActions(isMobile); 

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: "error.main", p: 2 }}>
        Error: {error}
      </Box>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>No posts available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {isMobile ? (
        // Mobile view - single column with comments drawer
        <>
          <Stack spacing={3}>
            {posts.map((post) => (
                <PostCard
                key={post._id}
                post={post}
                loggedInUserId={loggedInUserId}
                handleFollowToggle={handleFollowToggle}
                handleConnectToggle={handleConnectToggle}
                handleLike={handleLike}
                toggleCommentInput={toggleCommentInput}
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
            <Box sx={{ display: 'flex', mb: 4 }}>
            <Box sx={{ flex: 2 }}>
              <PostCard 
                post={selectedPost}
                loggedInUserId={loggedInUserId}
                handleFollowToggle={handleFollowToggle}
                handleConnectToggle={handleConnectToggle}
                handleLike={handleLike}
                toggleCommentInput={toggleCommentInput}
                toggleExpand={toggleExpand}
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
                handleCommentSubmit={handleCommentSubmit}
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
                .filter(p => p._id !== selectedPost._id)
                .map(post => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <PostCard 
                      post={post}
                      onClick={() => setSelectedPost(post)}
                      loggedInUserId={loggedInUserId}
                      handleLike={handleLike}
                      openModal={openModal}
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
                loggedInUserId={loggedInUserId}
                handleLike={handleLike}
                openModal={openModal}
              />
            </Grid>
          ))}
        </Grid>
      )}

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

export default GetPosts;