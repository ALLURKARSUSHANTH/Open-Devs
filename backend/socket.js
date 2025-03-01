const { Server } = require('socket.io');
const Chat = require('./models/chatModel');
const User = require('./models/User');
const Notification = require('./models/Notification');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Replace with your frontend URL
      methods: ['GET', 'POST'],
    },
  });

  const activeUsers = new Set();

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Add user to active users
    socket.on('joinRoom', (userId) => {
      socket.join(userId);
      activeUsers.add(userId);
      io.emit('activeUsers', Array.from(activeUsers)); // Emit active users list
    });

    // Handle private messages
    socket.on('sendMessage', async (data) => {
      const { senderId, receiverId, message } = data;

      // Save the message to the database
      const chat = new Chat({ senderId, receiverId, message });
      await chat.save();

      // Emit the message to the receiver's room
      io.to(receiverId).emit('receiveMessage', chat);
      console.log(`Message sent from ${senderId} to ${receiverId}: ${message}`);
    });

    // Handle accepting a connection request
    socket.on('acceptRequest', async (data) => {
      const { userId, senderId } = data;

      try {
        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!user || !sender) {
          throw new Error('User or sender not found');
        }

        // Remove the sender's ID from the user's connectionRequests array
        user.connectionRequests = user.connectionRequests.filter(
          (id) => id.toString() !== senderId
        );

        // Add the sender's ID to the user's connections array
        user.connections.push(senderId);

        // Add the user's ID to the sender's connections array
        sender.connections.push(userId);

        // Save both users
        await user.save();
        await sender.save();

        // Mark the notification as read
        await Notification.updateMany(
          { userId: userId, senderId: senderId },
          { $set: { isRead: true } }
        );

        // Notify the sender that their request was accepted
        const notification = new Notification({
          userId: senderId,
          message: `${user.displayName} accepted your connection request.`,
          senderId: userId,
        });
        await notification.save();

        // Emit a notification to the sender
        io.to(senderId).emit('newNotification', notification);

        console.log(`Connection request accepted by ${userId} from ${senderId}`);
      } catch (error) {
        console.error('Error accepting connection request:', error);
      }
    });

    // Handle rejecting a connection request
    socket.on('rejectRequest', async (data) => {
      const { userId, senderId } = data;

      try {
        const user = await User.findById(userId);

        if (!user) {
          throw new Error('User not found');
        }

        // Remove the sender's ID from the user's connectionRequests array
        user.connectionRequests = user.connectionRequests.filter(
          (id) => id.toString() !== senderId
        );

        // Save the user
        await user.save();

        // Delete the notification
        await Notification.deleteMany({ userId: userId, senderId: senderId });

        // Notify the sender that their request was rejected
        const notification = new Notification({
          userId: senderId,
          message: `${user.displayName} rejected your connection request.`,
          senderId: userId
        });
        await notification.save();

        // Emit a notification to the sender
        io.to(senderId).emit('newNotification', notification);

        console.log(`Connection request rejected by ${userId} from ${senderId}`);
      } catch (error) {
        console.error('Error rejecting connection request:', error);
      }
    });

    // Handle new follower notifications
    socket.on('follow', async (data) => {
        const { userId, followUserId } = data;
      
        try {
          const user = await User.findById(userId);
          const followUser = await User.findById(followUserId);
      
          if (!user || !followUser) {
            throw new Error('User or follow user not found');
          }
      
          // Create a notification for the user being followed
          const notification = new Notification({
            userId: followUserId,
            message: `${user.displayName} started following you.`,
            senderId: userId,
            type: 'newFollower',
          });
          await notification.save();
      
          // Emit a notification to the user being followed
          io.to(followUserId).emit('newNotification', notification);
      
          console.log(`New follower notification sent to ${followUserId} from ${userId}`);
        } catch (error) {
          console.error('Error handling follow event:', error);
        }
      });
    

    // Remove user from active users on disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
      activeUsers.delete(socket.userId);
      io.emit('activeUsers', Array.from(activeUsers)); // Emit updated active users list
    });
  });

  return io; // Return the initialized `io` instance
};

module.exports = { initializeSocket };