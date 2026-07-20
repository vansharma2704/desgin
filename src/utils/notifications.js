// Simple persistent notifications store using localStorage
export const getNotifications = () => {
  try {
    const list = localStorage.getItem('studio_notifications');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
};

export const saveNotifications = (list) => {
  try {
    localStorage.setItem('studio_notifications', JSON.stringify(list));
    // Dispatch custom event to notify all components in the current tab
    window.dispatchEvent(new Event('studio_notifications_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const addNotification = (type, message, link) => {
  const list = getNotifications();
  const newNotif = {
    id: 'notif_' + Date.now() + Math.random().toString(36).substr(2, 5),
    type, // 'editor' | 'reviewer'
    message,
    link,
    createdAt: new Date().toISOString(),
    isRead: false
  };
  list.unshift(newNotif);
  saveNotifications(list);
};

export const markAsRead = (id) => {
  const list = getNotifications();
  const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
  saveNotifications(updated);
};

export const clearAllNotifications = () => {
  saveNotifications([]);
};
