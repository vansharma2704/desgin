import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications, markAsRead, clearAllNotifications } from '../utils/notifications';

export default function NotificationBell({ role }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = () => {
    const all = getNotifications();
    // Filter based on the target role
    const filtered = all.filter(n => n.type === role);
    setNotifications(filtered);
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('studio_notifications_updated', loadNotifications);
    
    // Close dropdown on click outside
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.bell-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('studio_notifications_updated', loadNotifications);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [role]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="bell-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          position: 'relative',
          transition: 'background 0.2s'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            background: '#EF4444',
            borderRadius: '50%',
            border: '2px solid #FFFFFF'
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '40px',
          width: '320px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAFC'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearAllNotifications(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    background: n.isRead ? '#FFFFFF' : 'rgba(108, 76, 241, 0.04)',
                    transition: 'background 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <p style={{
                    margin: 0,
                    fontSize: '12.5px',
                    color: '#1E293B',
                    fontWeight: n.isRead ? 500 : 700,
                    lineHeight: 1.4,
                    textAlign: 'left'
                  }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'left' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
