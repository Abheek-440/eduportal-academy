const Message = require("../models/Message");
const User = require("../models/User");

// Fetch chat contacts with last message preview and timestamp
exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Fetch all users except current logged in user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("-password")
      .sort({ name: 1 });

    // Attach last message for each contact
    const contactsWithLastMsg = await Promise.all(
      users.map(async (u) => {
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: u._id },
            { senderId: u._id, receiverId: currentUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
          lastMessage: lastMsg ? lastMsg.message : "",
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          lastSenderId: lastMsg ? lastMsg.senderId.toString() : null,
        };
      })
    );

    // Sort: users with conversations first (most recent message), then alphabetically
    contactsWithLastMsg.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return a.name.localeCompare(b.name);
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json(contactsWithLastMsg);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat contacts", error: err.message });
  }
};

// Fetch message history between two users
exports.getmessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};