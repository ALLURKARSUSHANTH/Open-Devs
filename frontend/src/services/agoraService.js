import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_APP_ID; // Get this from agora.io console
const token = null; // Use temp token for testing, implement proper token service for production

const client = createClient({ mode: 'live', codec: 'vp8' });

export const AgoraService = {
  client,
  createTracks: createMicrophoneAndCameraTracks,
  
  async joinChannel(channelName, uid, role = 'host') {
    await this.client.setClientRole(role);
    return this.client.join(APP_ID, channelName, token, uid);
  },

  leaveChannel() {
    return this.client.leave();
  },

  async publish(localTracks) {
    await this.client.publish(localTracks);
  },

  async unpublish(localTracks) {
    await this.client.unpublish(localTracks);
  },
};