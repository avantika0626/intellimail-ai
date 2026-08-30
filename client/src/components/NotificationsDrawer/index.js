import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, CheckCircle2, Info, AlertOctagon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotif = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on('notification:new', handleNewNotif);
    socket.on('notification:broadcast', handleNewNotif);

    return () => {
      socket.off('notification:new', handleNewNotif);
      socket.off('notification:broadcast', handleNewNotif);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id || id === 'all' ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'escalation':
      case 'error':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-primary-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Operational Alerts & Logs
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAsRead('all')}
                className="text-xs text-primary-400 hover:text-primary-300 font-medium transition"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                No execution alerts or notifications yet.
              </div>
            ) : (
              notifications.map((notif) => {
                const notifId = notif._id || notif.id;
                return (
                  <div
                    key={notifId}
                    className={`p-3 rounded-xl border transition-all ${
                      notif.isRead
                        ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                        : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80 shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-semibold text-slate-100 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 mb-2">{notif.message}</p>
                        
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                          {notif.executionId ? (
                            <Link
                              href={`/executions/${notif.executionId}`}
                              onClick={onClose}
                              className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 font-mono"
                            >
                              Inspect Run <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : <span />}

                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notifId)}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
