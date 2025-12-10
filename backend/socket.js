const { Server } = require('socket.io');
const Chat = require('./models/chatModel');
const User = require('./models/User');
const Notification = require('./models/Notification');
const {POINT_RULES,getCurrentLevel} = require('./utils/levels');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const activeUsers = new Set();

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

        
    // Add user to active users
    socket.on('joinRoom', (userId) => {
      // Remove old userId if reconnecting
      if (socket.userId && socket.userId !== userId) {
        activeUsers.delete(socket.userId);
      }
      socket.userId = userId; // Store userId on socket for disconnect cleanup
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

        const [user1, user2] = await Promise.all([
          User.findById(userId),
          User.findById(connectionId)
        ]);
    
        if (user1) {
          user1.points += POINT_RULES.connectionMade;
          const newLevel1 = getCurrentLevel(user1.points);
          if (newLevel1 !== user1.level) user1.level = newLevel1;
          await user1.save();
        }
    
        if (user2) {
          user2.points += POINT_RULES.connectionMade;
          const newLevel2 = getCurrentLevel(user2.points);
          if (newLevel2 !== user2.level) user2.level = newLevel2;
          await user2.save();
        }

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

    // Handle follow event
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

          // Emit the notification to the user being followed
          io.to(followUserId).emit('newNotification', notification);

          console.log(`User ${userId} followed ${followUserId}`);
        } catch (error) {
          console.error('Error handling follow event:', error);
        }
      });

      // Handle unfollow event
      socket.on('unfollow', async (data) => {
        const { userId, followUserId } = data;

        try {
          const user = await User.findById(userId);
          const followUser = await User.findById(followUserId);

          if (!user || !followUser) {
            throw new Error('User or follow user not found');
          }

          // Create a notification for the user being unfollowed
          const notification = new Notification({
            userId: followUserId,
            message: `${user.displayName} unfollowed you.`,
            senderId: userId,
            type: 'newFollower',
          });
          await notification.save();

          // Emit the notification to the user being unfollowed
          io.to(followUserId).emit('newNotification', notification);

          console.log(`User ${userId} unfollowed ${followUserId}`);
        } catch (error) {
          console.error('Error handling unfollow event:', error);
        }
      });
      
      socket.on('mentorship-request', async (data) => {
        const { userId, mentorId } = data;

        try {
          const user = await User.findById(userId);
          const mentor = await User.findById(mentorId);

          if (!user || !mentor) {
            throw new Error('User or mentor not found');
          }

          // Create a notification for the mentor
          const notification = new Notification({
            userId: mentorId,
            message: `${user.displayName} requested mentorship.`,
            senderId: userId,
            type: 'mentorshipRequest',
          });
          await notification.save();

          // Emit the notification to the mentor
          io.to(mentorId).emit('newNotification', notification);

          console.log(`Mentorship request sent from ${userId} to ${mentorId}`);
        } catch (error) {
          console.error('Error handling mentorship request:', error);
        }
      });
      
      socket.on('acceptMentorship', async (data) => {
        const { userId, menteeId } = data;

        try {
          const user = await User.findById(userId);
          const mentee = await User.findById(menteeId);

          if (!user || !mentee) {
            throw new Error('User or mentee not found');
          }

          // Create a notification for the mentee
          const notification = new Notification({
            userId: menteeId,
            message: `${user.displayName} accepted your mentorship request.`,
            senderId: userId,
            type: 'mentorshipRequest',
          });
          await notification.save();

          // Emit the notification to the mentee
          io.to(menteeId).emit('newNotification', notification);

          console.log(`Mentorship accepted from ${userId} to ${menteeId}`);
        } catch (error) {
          console.error('Error handling mentorship acceptance:', error);
        }
      });

    socket.on('rejectMentorship', async (data) => {
      const { userId, menteeId } = data;

      try {
        const user = await User.findById(userId);
        const mentee = await User.findById(menteeId);

        if (!user || !mentee) {
          throw new Error('User or mentee not found');
        }

        // Create a notification for the mentee
        const notification = new Notification({
          userId: menteeId,
          message: `${user.displayName} rejected your mentorship request.`,
          senderId: userId,
          type: 'mentorshipRequest',
        });
        await notification.save();

        // Emit the notification to the mentee
        io.to(menteeId).emit('newNotification', notification);

        console.log(`Mentorship rejected from ${userId} to ${menteeId}`);
      } catch (error) {
        console.error('Error handling mentorship rejection:', error);
      }
    } );
  

    // Remove user from active users on disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
      // Remove from active users
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        io.emit('activeUsers', Array.from(activeUsers));
      }
    });
  });

  return io; // Return the initialized `io` instance
};

module.exports = { initializeSocket };