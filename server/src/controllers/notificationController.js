const Notification = require('../models/Notification');

class NotificationController {
  async list(req, res, next) {
    try {
      const notifications = await Notification.find({ owner: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({ owner: req.user.id, isRead: false });

      res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      if (id === 'all') {
        await Notification.updateMany({ owner: req.user.id }, { $set: { isRead: true } });
        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
      }

      await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
