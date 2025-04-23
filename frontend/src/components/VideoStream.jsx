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
  const localTracksRef = useRef({
    audioTrack: null,
    videoTrack: null
  });

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

  useEffect(() => {
    if (joined && isHost) {
      console.debug('Video element state:', {
        element: document.getElementById('local-video-preview'),
        hasTrack: !!localTracksRef.current?.videoTrack,
        isPlaying: localVideoRef.current?.readyState === 4
      });
      
      // Emergency fallback - try reattaching after delay
      const timer = setTimeout(() => {
        if (!localVideoRef.current?.srcObject && localTracksRef.current?.videoTrack) {
          console.warn('Reattaching video track');
          localTracksRef.current.videoTrack.play(localVideoRef.current);
        }
      }, 1000);
  
      return () => clearTimeout(timer);
    }
  }, [joined, isHost]);

  const joinChannel = async (asHost = false) => {
    try {
      if (!channelName) {
        alert('Please enter channel name');
        return;
      }

      setIsHost(asHost);
      
      // Create tracks (with safety wrapper)
      const tracks = await AgoraService.createTracks();
      localTracksRef.current = tracks;

      // SAFETY CHECK: Ensure video element exists before playing
      if (asHost && tracks.videoTrack && localVideoRef.current) {
        tracks.videoTrack.play(localVideoRef.current);
      } else if (!localVideoRef.current) {
        console.error('Video element not available!');
      }

      await AgoraService.joinChannel(channelName, null, asHost ? 'host' : 'audience');
      
      if (asHost && tracks.audioTrack) {
        await AgoraService.publish([tracks.audioTrack, tracks.videoTrack].filter(Boolean));
      }

      setJoined(true);
    } catch (error) {
      console.error('Join failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const leaveChannel = async () => {
    try {
      const { audioTrack, videoTrack } = localTracksRef.current;
      
      if (audioTrack) audioTrack.close();
      if (videoTrack) videoTrack.close();
      
      await AgoraService.leaveChannel();
      
      // Reset references
      localTracksRef.current = { audioTrack: null, videoTrack: null };
      setJoined(false);
      setIsHost(false);
    } catch (error) {
      console.error('Leave error:', error);
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
              <Box sx={{ 
                position: 'relative', 
                width: '100%', 
                height: '300px', 
                bgcolor: 'black',
                display: 'flex' 
              }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Typography variant="caption">
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