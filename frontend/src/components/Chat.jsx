import React, { useState, useEffect , useRef} from 'react';
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
} from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// My custom UI for chat
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[3],
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const MessageBubble = styled(Paper)(({ theme, isSender }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: isSender
    ? theme.palette.mode === 'dark'
      ? theme.palette.primary.dark 
      : theme.palette.primary.main 
    : theme.palette.mode === 'dark'
    ? theme.palette.grey[800] 
    : theme.palette.grey[200],
  color: isSender
    ? theme.palette.getContrastText(
        theme.palette.mode === 'dark'
          ? theme.palette.primary.dark
          : theme.palette.primary.main
      )
    : theme.palette.text.primary,
  borderRadius: isSender ? '12px 12px 0 12px' : '12px 12px 12px 0',
  maxWidth: '70%',
  wordWrap: 'break-word',
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

  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Get the logged-in user's UID
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

  // Fetch the user's connections
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
        } catch (error) {
          console.error('Failed to fetch connections:', error);
        } finally {
          setLoadingConnections(false);
        }
      };

      fetchConnections();
    }
  }, [userId]);

  // Fetch chat history when a connection is selected
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
          })
          )
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      };

      fetchMessages();
    }
  }, [userId, selectedConnection]);

  // Join the user's room and listen for real-time events
  useEffect(() => {
    if (userId) {
      socket.emit('joinRoom', userId);

      // Listen for active users
      socket.on('activeUsers', (users) => {
        console.log('Active Users Received:', users);
        setActiveUsers(users);
      });

      // Listen for new messages
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
            [newMessage.senderId]: (prevUnreadCount[newMessage.senderId]  || 0)+ 1,
          }));
        }
      });
    }

    return () => {
      socket.off('activeUsers');
      socket.off('receiveMessage');
    };
  }, [userId, selectedConnection]);

  // Send a message and update the UI optimistically
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

  // Sort connections by last message timestamp
  const sortedConnections = connections.sort((a, b) => {
    const lastMessageA = messages.filter((msg) => msg.senderId === a._id || msg.receiverId === a._id).pop();
    const lastMessageB = messages.filter((msg) => msg.senderId === b._id || msg.receiverId === b._id).pop();
    return new Date(lastMessageB?.createdAt || 0) - new Date(lastMessageA?.createdAt || 0);
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {!selectedConnection && (
        <StyledPaper
          sx={{
            width: isSmallScreen ? '100%' : '25%',
            p: 2,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Connections
          </Typography>
          {loadingConnections ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : connections.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No connections found.
            </Typography>
          ) : (
            <List>
              {sortedConnections.map((connection) => (
                <ListItem
                  button
                  key={connection._id}
                  onClick={() => setSelectedConnection(connection._id)}
                  sx={{
                    backgroundColor:
                      selectedConnection === connection._id
                        ? theme.palette.action.selected
                        : 'inherit',
                    borderRadius: 1,
                    mb: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Badge
                  badgeContent={unreadCount[connection._id] || 0}
                  color="error"
                  sx={{ mr: 2 }}>
                  <Avatar
                    src={connection.photoURL}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  </Badge>
                  <ListItemText
                    primary={
                      <Typography variant="body1" color="textPrimary">
                        {connection.displayName}
                      </Typography>
                    }
                    secondary={
                      <Typography component="span" variant="body2" color="textSecondary">
                        {activeUsers.includes(connection._id) ? (
                          <Chip label="Online" size="small" color="success" />
                        ) : (
                          <Chip label="Offline" size="small" color="error" />
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </StyledPaper>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: isSmallScreen ? 1 : 2,
        }}
      >
        {/* Show back button to exit current chat */}
        {selectedConnection && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,position:'sticky', top: 0, backgroundColor: theme.palette.background.paper, zIndex: 1, p: 1 }}>
            <IconButton onClick={() => setSelectedConnection(null)}>
              <ArrowBackIcon />
            </IconButton>
            <Avatar
                    src={connections.find((c) => c._id === selectedConnection)?.photoURL}
                    sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6">
              Chat with {connections.find((c) => c._id === selectedConnection)?.displayName}
            </Typography>
          </Box>
        )}

        {selectedConnection ? (
          <>
            <StyledPaper sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
              <Divider sx={{ mb: 2 }} />
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No messages yet. Start the conversation!
                </Typography>
              ) : (
                messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <MessageBubble isSender={msg.senderId === userId}>
                      <Typography variant="body1">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </Typography>
                    </MessageBubble>
                  </Box>
                ))
              )}
              <div ref={messageRef}/>
            </StyledPaper>

            {/* Message Input */}
            <Box sx={{ display: 'inherit', gap: 2,position: 'sticky', bottom: 50, p: 2, backgroundColor: theme.palette.background.paper             }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                sx={{ backgroundColor: theme.palette.background.paper }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Select a connection to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;