import React, { useEffect, useRef, useState } from 'react';
import socket from '../context/socket';
import { Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';

const VideoStream = ({ userId }) => {
  const [streams, setStreams] = useState([]);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [viewers, setViewers] = useState(0);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnections = useRef({});
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Request active streams
    socket.emit('getActiveStreams');

    // Event listeners
    const handleStreamStarted = ({ userId: streamerId }) => {
      setStreams(prev => [...prev, { userId: streamerId }]);
    };

    const handleStreamEnded = (endedUserId) => {
      setStreams(prev => prev.filter(stream => stream.userId !== endedUserId));
      if (remoteStream && remoteStream.userId === endedUserId) {
        setRemoteStream(null);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    };

    const handleActiveStreams = (activeStreams) => {
      setStreams(activeStreams);
    };

    const handleViewerCount = (count) => {
      setViewers(count);
    };

    const handleOffer = async ({ offer, sender }) => {
      if (sender === userId) return;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ]
      });
      peerConnections.current[sender] = pc;

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('ice-candidate', {
            candidate: e.candidate,
            target: sender
          });
        }
      };

      pc.ontrack = (e) => {
        if (e.streams && e.streams[0] && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          setRemoteStream({ userId: sender, stream: e.streams[0] });
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { answer, target: sender });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    };

    const handleAnswer = async ({ answer, sender }) => {
      const pc = peerConnections.current[sender];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate, sender }) => {
      const pc = peerConnections.current[sender];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    };

    socket.on('streamStarted', handleStreamStarted);
    socket.on('streamEnded', handleStreamEnded);
    socket.on('activeStreams', handleActiveStreams);
    socket.on('viewerCount', handleViewerCount);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('streamStarted', handleStreamStarted);
      socket.off('streamEnded', handleStreamEnded);
      socket.off('activeStreams', handleActiveStreams);
      socket.off('viewerCount', handleViewerCount);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      
      stopStreaming();
    };
  }, [userId]);

  const startStreaming = async () => {
    // Check if stream already exists
    if (myStream) {
      console.log("Stream already exists.");
      return;  // Exit early if the stream is already started
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 500,
          frameRate: 30,
          facingMode: 'user',
        },
        audio: true
      });
  
      // Create a new stream to avoid reference issues
      const newStream = new MediaStream();
      stream.getTracks().forEach(track => newStream.addTrack(track));
  
      setMyStream(newStream); // Store the new stream
  
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = newStream;
        myVideoRef.current.onloadedmetadata = () => {
          myVideoRef.current.play().catch(e => console.error('Play failed:', e));
        };
      }
  
      socket.emit('startStream', { userId });  // Emit to signal that streaming has started
  
    } catch (err) {
      console.error('Error starting stream:', err);
      alert(`Camera error: ${err.message}`);
    }
  };
  
  


  const stopStreaming = () => {
    // Stop the local stream
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
      setMyStream(null);
      socket.emit('stopStream', userId);
      
      // Close all peer connections to avoid leftover connections
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {}; // Clear peer connections map
    }
  
    // Reset the remote video element
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setRemoteStream(null); // Reset the remote stream state
  };
  
  

  const watchStream = async (streamerId) => {
    if (streamerId === userId) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          setRemoteStream({ userId: streamerId, stream });
        }
        return;
      } catch (err) {
        console.error('Error accessing media for same-device test:', err);
        return;
      }
    }
    
    socket.emit('joinStream', { streamerId });
  };
  

  const handleBack = () => {
    navigate('/post');
  };
  useEffect(() => {
    if (myStream && myVideoRef.current) {
      console.log('Effect assignment to video element');
      myVideoRef.current.srcObject = myStream;
      myVideoRef.current.onloadedmetadata = () => {
        myVideoRef.current.play().catch(e => console.error('Effect play failed:', e));
      };
    }
  }, [myStream]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <IconButton onClick={() => navigate('/post')}>
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h4" gutterBottom>Video Streaming</Typography>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '10px' }}>
          <Typography variant="h6">Your Stream</Typography>
          <video ref={myVideoRef} autoPlay muted playsInline style={{ width: '100%' }} />
          {myStream ? (
            <Button onClick={stopStreaming} color="error" fullWidth>
              Stop Streaming
            </Button>
          ) : (
            <Button onClick={startStreaming} disabled={isLoading} fullWidth>
              {isLoading ? 'Starting...' : 'Start Streaming'}
            </Button>
          )}
        </div>

        <div style={{ border: '1px solid #ddd', padding: '10px' }}>
          <Typography variant="h6">Remote Stream</Typography>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%' }} />
          {remoteStream && (
            <Button onClick={stopWatching} color="secondary" fullWidth>
              Stop Watching
            </Button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Typography variant="h5">Active Streams</Typography>
        {streams.filter(s => s.userId !== userId).map(stream => (
          <div key={stream.userId} style={{ margin: '10px 0' }}>
            <Typography>Stream by {stream.userId}</Typography>
            <Button 
              onClick={() => watchStream(stream.userId)}
              disabled={!!remoteStream || isLoading}
            >
              Watch
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoStream;