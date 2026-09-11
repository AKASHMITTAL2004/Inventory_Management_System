import Notification from "../models/Notification.js";

// Fetch unread notifications for the bell icon in the top bar
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      organization_id: req.user.orgId,
      read: false 
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark notifications as read so they disappear from the dropdown
export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body; // Expecting an array of IDs
    
    await Notification.updateMany(
      { _id: { $in: notificationIds }, organization_id: req.user.orgId },
      { $set: { read: true } }
    );

    res.json({ message: "Notifications updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};