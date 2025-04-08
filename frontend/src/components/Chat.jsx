import React, { useState, useEffect, useRef } from 'react';
import socket from '../context/socket';
import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Avatar,
  useMediaQuery,
  useTheme,
  IconButton,
  Badge,
  Slide,
  Fade,
  Grow,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MoodIcon from '@mui/icons-material/Mood';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate, useParams } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
}));

const MessageBubble = styled(Paper)(({ theme, isSender }) => ({
  padding: theme.spacing(1.5, 2),
  backgroundColor: isSender
    ? theme.palette.primary.main
    : theme.palette.mode === 'dark'
    ? theme.palette.grey[800]
    : theme.palette.grey[100],
  color: isSender
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  borderRadius: isSender ? '18px 18px 0 18px' : '18px 18px 18px 0',
  maxWidth: '75%',
  wordWrap: 'break-word',
  boxShadow: theme.shadows[1],
  transition: 'all 0.2s ease',
}));

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState({});
  const messageRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { uid } = useParams();
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (uid) {
      setSelectedConnection(uid);
    }
  }, [uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      setLoadingConnections(true);
      const fetchConnections = async () => {
        try {
          const response = await axios.get(`${API_URL}/connections/connected/${userId}`);
          setConnections(response.data.connections);
          const initialUnreadMessages = {};
          response.data.connections.forEach((connection) => {
            initialUnreadMessages[connection._id] = 0;
          });
          setUnreadCount(initialUnreadMessages);

          if (uid && response.data.connections.some(c => c._id === uid)) {
            setSelectedConnection(uid);
          }
        } catch (error) {
          console.error('Failed to fetch connections:', error);
        } finally {
          setLoadingConnections(false);
        }
      };

      fetchConnections();
    }
  }, [userId, uid]);

  useEffect(() => {
    if (userId && selectedConnection) {
      setLoadingMessages(true);
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`${API_URL}/messages/${userId}/${selectedConnection}`);
          setMessages(response.data);
          setUnreadCount((prevUnreadCount) => ({
            ...prevUnreadCount,
            [selectedConnection]: 0,
          }));
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      };

      fetchMessages();
    }
  }, [userId, selectedConnection]);

  useEffect(() => {
    if (userId) {
      socket.emit('joinRoom', userId);

      socket.on('activeUsers', (users) => {
        setActiveUsers(users);
      });

      socket.on('receiveMessage', (newMessage) => {
        if (
          newMessage.senderId === selectedConnection ||
          newMessage.receiverId === selectedConnection
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        if(newMessage.senderId !== selectedConnection) {
          setUnreadCount((prevUnreadCount) => ({
            ...prevUnreadCount,
            [newMessage.senderId]: (prevUnreadCount[newMessage.senderId] || 0) + 1,
          }));
        }
      });
    }

    return () => {
      socket.off('activeUsers');
      socket.off('receiveMessage');
    };
  }, [userId, selectedConnection]);

  const sendMessage = () => {
    if (message.trim() && userId && selectedConnection) {
      const newMessage = {
        senderId: userId,
        receiverId: selectedConnection,
        message: message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      socket.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const sortedConnections = connections.sort((a, b) => {
    const lastMessageA = messages.filter((msg) => msg.senderId === a._id || msg.receiverId === a._id).pop();
    const lastMessageB = messages.filter((msg) => msg.senderId === b._id || msg.receiverId === b._id).pop();
    return new Date(lastMessageB?.createdAt || 0) - new Date(lastMessageA?.createdAt || 0);
  });

  const handleBackClick = () => {
    setSelectedConnection(null);
    if (uid) {
      navigate('/chat');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        height: 'calc(100vh - 64px)',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Connections List */}
      {!selectedConnection && (
        <Slide direction="left" in={!selectedConnection} mountOnEnter unmountOnExit>
          <StyledPaper
            sx={{
              width: isSmallScreen ? '100%' : '320px',
              p: 2,
              overflowY: 'auto',
              mr: isSmallScreen ? 0 : 2,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Your Connections
            </Typography>
            {loadingConnections ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : connections.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No connections yet
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {sortedConnections.map((connection) => (
                  <Grow in key={connection._id}>
                    <ListItem
                      button
                      onClick={() => setSelectedConnection(connection._id)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Badge
                        overlap="circular"
                        badgeContent={unreadCount[connection._id] || 0}
                        color="error"
                        sx={{ mr: 2 }}
                      >
                        <Avatar
                          src={connection.photoURL}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            border: `2px solid ${
                              activeUsers.includes(connection._id) 
                                ? theme.palette.success.main 
                                : theme.palette.grey[500]
                            }`
                          }}
                        />
                      </Badge>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={unreadCount[connection._id] ? 600 : 500}
                            color={unreadCount[connection._id] ? 'primary.main' : 'text.primary'}
                          >
                            {connection.displayName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            {activeUsers.includes(connection._id) ? (
                              <Chip 
                                label="Online" 
                                size="small" 
                                color="success" 
                                sx={{ height: 20, fontSize: '0.75rem' }}
                              />
                            ) : (
                              <Chip 
                                label="Offline" 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: theme.palette.grey[300],
                                  color: theme.palette.grey[700]
                                }}
                              />
                            )}
                          </Box>
                        }
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  </Grow>
                ))}
              </List>
            )}
          </StyledPaper>
        </Slide>
      )}

      {/* Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}
      >
        {selectedConnection ? (
          <>
            {/* Chat Header */}
            <Paper 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2,
                borderRadius: 0,
                boxShadow: theme.shadows[1],
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <IconButton onClick={handleBackClick} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Avatar
                src={connections.find((c) => c._id === selectedConnection)?.photoURL}
                sx={{ 
                  width: 48, 
                  height: 48,
                  mr: 2,
                  cursor: 'pointer',
                  border: `2px solid ${
                    activeUsers.includes(selectedConnection)
                      ? theme.palette.success.main
                      : theme.palette.grey[500]
                  }`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const uid = connections.find((c) => c._id === selectedConnection)?._id;
                  if (uid) navigate(`/profile/${uid}`);
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {connections.find((c) => c._id === selectedConnection)?.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeUsers.includes(selectedConnection) ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Paper>

            {/* Messages */}
            <Box 
              sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 2,
                backgroundImage: theme.palette.mode === 'dark'
                  ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                  : 'linear-gradient(rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03))',
              }}
            >
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '60%',
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No messages yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start the conversation with {connections.find((c) => c._id === selectedConnection)?.displayName}
                  </Typography>
                </Box>
              ) : (
                messages.map((msg, index) => (
                  <Fade in key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <MessageBubble isSender={msg.senderId === userId}>
                        <Typography variant="body1">{msg.message}</Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5, 
                            opacity: 0.7,
                            textAlign: msg.senderId === userId ? 'right' : 'left'
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </MessageBubble>
                    </Box>
                  </Fade>
                ))
              )}
              <div ref={messageRef} />
            </Box>

            {/* Message Input */}
            <Paper 
              sx={{ 
                p: 2,
                borderRadius: 0,
                boxShadow: theme.shadows[1],
                position: 'sticky',
                bottom: 0,
                paddingBottom: 8,
                zIndex: 10,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Emoji">
                  <IconButton>
                    <MoodIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Attach file">
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '24px',
                      backgroundColor: theme.palette.background.paper,
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={sendMessage}
                          disabled={!message.trim()}
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            },
                            '&:disabled': {
                              backgroundColor: theme.palette.grey[400],
                            }
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 3,
                backgroundColor: theme.palette.grey[300],
                color: theme.palette.grey[600]
              }}
            >
              <ChatIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {uid ? 'Loading conversation...' : 'Select a connection to start chatting'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {uid ? '' : 'Choose from your connections list to begin messaging'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;