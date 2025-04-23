import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_APP_ID;
const token = null;

const client = createClient({ mode: 'live', codec: 'vp8' });

export const AgoraService = {
  client,
  
  async createTracks() {
    try {
      const [micTrack, cameraTrack] = await createMicrophoneAndCameraTracks(
        {}, 
        {
          encoderConfig: '720p_1',
          optimizationMode: 'detail' // Better for streaming
        }
      );
      return {
        audioTrack: micTrack,
        videoTrack: cameraTrack
      }; // Return as object for clarity
    } catch (error) {
      console.error('Track creation error:', error);
      // Fallback to audio-only if video fails
      const micTrack = await createMicrophoneAndCameraTracks({}, { cameraOn: false });
      return {
        audioTrack: micTrack[0],
        videoTrack: null
      };
    }
  },
  
  async joinChannel(channelName, uid, role = 'host') {
    await this.client.setClientRole(role);
    return this.client.join(APP_ID, channelName, token, uid);
  },

  leaveChannel() {
    return this.client.leave();
  },

  async publish(localTracks) {
    if (localTracks) {
      await this.client.publish(localTracks);
    }
  },

  async unpublish(localTracks) {
    if (localTracks) {
      await this.client.unpublish(localTracks);
    }
  },
};