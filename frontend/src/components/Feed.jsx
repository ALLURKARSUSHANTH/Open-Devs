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
  Fade,
  Grow,
  Paper,
  Divider,
  useTheme
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CloseIcon from "@mui/icons-material/Close";
import PostCard from "./PostsCard";
import CommentsSection from "./Comments";
import usePostActions from "./postActions";

const GetPosts = () => {
  const mytheme = useTheme();
  const isMobile = useMediaQuery(mytheme.breakpoints.down("sm"));
  const {
    posts,
    theme,
    loading,
    error,
    loggedInUserId,
    selectedImages,
    isModalOpen,
    postComments,
    expandedPosts,
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
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "200px"
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Box sx={{ 
          backgroundColor: "error.light", 
          p: 2,
          borderRadius: 1,
          textAlign: "center",
          maxWidth: 400,
          mx: "auto",
          my: 2
        }}>
          <Typography color="error.main" fontWeight="medium">
            Error loading posts: {error}
          </Typography>
        </Box>
      </Fade>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Fade in>
        <Paper elevation={0} sx={{ 
          p: 3, 
          textAlign: "center",
          backgroundColor: "background.paper",
          borderRadius: 2,
          maxWidth: 400,
          mx: "auto",
          my: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No posts available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Be the first to create a post!
          </Typography>
        </Paper>
      </Fade>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3,
      maxWidth: "100%",
      overflowX: "hidden"
    }}>
      {isMobile ? (
        // Mobile view - single column with comments drawer
        <>
          <Stack spacing={2}>
            {posts.map((post, index) => (
              <Grow in timeout={(index + 1) * 150} key={post._id}>
                <Box>
                  <PostCard
                    post={post}
                    loggedInUserId={loggedInUserId}
                    handleFollowToggle={handleFollowToggle}
                    handleConnectToggle={handleConnectToggle}
                    handleLike={handleLike}
                    toggleCommentInput={toggleCommentInput}
                    expandedPosts={expandedPosts}
                    toggleExpand={toggleExpand}
                    openModal={openModal}
                    theme={theme}
                  />
                </Box>
              </Grow>
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
          <Box sx={{ 
            display: 'flex', 
            mb: 4,
            gap: 3,
            alignItems: 'flex-start'
          }}>
            <Box sx={{ 
              flex: 2,
              position: 'sticky',
              top: 80
            }}>
              <PostCard 
                post={selectedPost}
                loggedInUserId={loggedInUserId}
                handleFollowToggle={handleFollowToggle}
                handleConnectToggle={handleConnectToggle}
                handleLike={handleLike}
                toggleCommentInput={toggleCommentInput}
                expandedPosts={expandedPosts}
                toggleExpand={toggleExpand}
                openModal={openModal}
                theme={theme}
                isExpanded
              />
            </Box>
            
            <Box sx={{ 
              flex: 1,
              position: 'sticky',
              top: 80,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: mytheme.palette.primary.main,
                borderRadius: '3px',
              }
            }}>
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

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ 
              mb: 3,
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Divider sx={{ flexGrow: 1, mr: 2 }} />
              More Posts
              <Divider sx={{ flexGrow: 1, ml: 2 }} />
            </Typography>
            <Grid container spacing={3}>
              {posts
                .filter(p => p._id !== selectedPost._id)
                .map((post, index) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <Grow in timeout={(index + 1) * 100}>
                      <Box>
                        <PostCard 
                          post={post}
                          onClick={() => {
                            setSelectedPost(post);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          loggedInUserId={loggedInUserId}
                          handleLike={handleLike}
                          openModal={openModal}
                        />
                      </Box>
                    </Grow>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Box>
      ) : (
        // Desktop grid view
        <Grid container spacing={3}>
          {posts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
              <Grow in timeout={(index % 4 + 1) * 150}>
                <Box>
                  <PostCard
                    post={post}
                    onClick={() => setSelectedPost(post)}
                    loggedInUserId={loggedInUserId}
                    handleLike={handleLike}
                    openModal={openModal}
                  />
                </Box>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Image modal */}
      <Modal 
        open={isModalOpen} 
        onClose={closeModal}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isModalOpen}>
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
              zIndex: mytheme.zIndex.modal
            }}
          >
            <IconButton
              onClick={closeModal}
              sx={{ 
                position: "absolute", 
                top: 16, 
                right: 16, 
                color: "white",
                backgroundColor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
              size="large"
            >
              <CloseIcon fontSize="large" />
            </IconButton>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              style={{ 
                width: "90%", 
                height: "90%",
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': mytheme.palette.primary.main,
              }}
            >
              {selectedImages.map((img, index) => (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <img
                      src={img}
                      alt={`Slide ${index}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default GetPosts;