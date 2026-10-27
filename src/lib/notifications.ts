export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
  type?: 'order' | 'promo' | 'system';
}

const STORAGE_KEY = 'sabuja_user_notifications';

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to Sabuja Haata! 🌿',
    message: 'Explore authentic farm-fresh organic vegetables and seasonal fruits sourced directly from local Odisha farmers.',
    timestamp: 'Just now',
    read: false,
    href: '/shop',
    type: 'system',
  },
];

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event('sabuja_notifications_updated'));
  } catch {
    // Ignore storage write errors
  }
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    title: notif.title,
    message: notif.message,
    timestamp: 'Just now',
    read: false,
    href: notif.href,
    type: notif.type || 'system',
  };
  saveStoredNotifications([newNotif, ...current]);
}

export function markAsRead(id: string): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStoredNotifications(updated);
}

export function markAllAsRead(): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(updated);
}

export function clearAllNotifications(): void {
  saveStoredNotifications([]);
}
