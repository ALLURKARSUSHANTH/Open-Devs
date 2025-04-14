import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, IconButton } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, ExitToApp } from '@mui/icons-material';
import { AgoraService } from '../services/agoraService';

const LiveStream = () => {
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [channelName, setChannelName] = useState('');
  
  const localVideoRef = useRef(null);
  const localTracksRef = useRef(null);

  // Initialize Agora client
  useEffect(() => {
    AgoraService.client.on('user-published', async (user, mediaType) => {
      await AgoraService.client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers(prevUsers => {
          if (!prevUsers.some(u => u.uid === user.uid)) {
            return [...prevUsers, user];
          }
          return prevUsers;
        });
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    AgoraService.client.on('user-unpublished', (user) => {
      setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    });

    return () => {
      AgoraService.client.removeAllListeners();
    };
  }, []);

  const joinChannel = async (asHost = false) => {
    try {
      if (!channelName) {
        alert('Please enter a channel name');
        return;
      }
  
      setIsHost(asHost);
      
      // Create local audio and video tracks
      localTracksRef.current = await AgoraService.createTracks();
    
      // Join the channel
      await AgoraService.joinChannel(channelName, null, asHost ? 'host' : 'audience');
      
      if (asHost) {
        // Host publishes their tracks
        await AgoraService.publish(localTracksRef.current);
        
        // Set up local video display after joining
        if (localVideoRef.current) {
          localVideoRef.current[1].play(localRef.current);
        }
      }
  
      setJoined(true);
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const leaveChannel = async () => {
    try {
      if (localTracksRef.current) {
        localTracksRef.current[0].close();
        localTracksRef.current[1].close();
        if (isHost) {
          await AgoraService.unpublish(localTracksRef.current);
        }
      }
      
      await AgoraService.leaveChannel();
      setJoined(false);
      setIsHost(false);
      setRemoteUsers([]);
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  const toggleAudio = () => {
    if (localTracksRef.current) {
      localTracksRef.current[0].setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localTracksRef.current) {
      localTracksRef.current[1].setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isHost ? 'Live Stream Host' : 'Live Stream Viewer'}
      </Typography>
      
      {!joined ? (
        <Card sx={{ p: 2, maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Join Channel
            </Typography>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter channel name"
              style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => joinChannel(true)}
              sx={{ mb: 2 }}
            >
              Start Broadcast
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => joinChannel(false)}
            >
              Join as Viewer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <Grid container spacing={2}>
          {isHost && (
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative', width: '100%', height: '300px', bgcolor: 'black' }}>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      left: 8, 
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      p: 0.5
                    }}
                  >
                    You (Host)
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {remoteUsers.map(user => (
              <Grid item xs={12} md={6} key={user.uid}>
                <Box sx={{ position: 'relative', width: '100%', height: '300px', bgcolor: 'black' }}>
                  <div
                    ref={ref => {
                      if (ref && user.videoTrack) {
                        user.videoTrack.play(ref);
                      }
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      left: 8, 
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      p: 0.5
                    }}
                  >
                    Host ID {user.uid}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {isHost && (
              <>
                <IconButton
                  color={audioEnabled ? 'primary' : 'secondary'}
                  onClick={toggleAudio}
                >
                  {audioEnabled ? <Mic /> : <MicOff />}
                </IconButton>
                <IconButton
                  color={videoEnabled ? 'primary' : 'secondary'}
                  onClick={toggleVideo}
                >
                  {videoEnabled ? <Videocam /> : <VideocamOff />}
                </IconButton>
              </>
            )}
            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToApp />}
              onClick={leaveChannel}
            >
              Leave Channel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LiveStream;