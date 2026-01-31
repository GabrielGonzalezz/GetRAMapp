const KEY_LAST_NOTIFIED = 'ram_last_notified';
const KEY_NOTIFICATIONS_ENABLED = 'ram_notifications_enabled';

const REMINDERS = [
  "Brain getting full? Dump it into RAM.",
  "You're doing great. Need to offload a thought?",
  "Quick check-in: How's your energy level?",
  "Don't hold it all in. Externalize it.",
  "Did you forget something? That's okay. Write it down.",
  "Closing tabs in your brain is allowed.",
  "Alert: Cognitive load high. Suggesting dump."
];

export const isSupported = (): boolean => {
  return 'Notification' in window;
};

export const hasPermission = (): boolean => {
  return isSupported() && Notification.permission === 'granted';
};

export const requestPermission = async (): Promise<boolean> => {
  if (!isSupported()) return false;
  if (Notification.permission === 'granted') return true;
  
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem(KEY_NOTIFICATIONS_ENABLED, 'true');
    sendNotification("Notifications Active", "We'll gently nudge you twice a day.");
    return true;
  }
  return false;
};

export const sendNotification = (title: string, body: string) => {
  if (hasPermission()) {
    try {
      new Notification(title, {
        body,
        icon: '/icon.png', // Fallback if no icon, browser uses default
        silent: false
      });
      localStorage.setItem(KEY_LAST_NOTIFIED, Date.now().toString());
    } catch (e) {
      console.error("Notification error:", e);
    }
  }
};

export const checkAndSendDailyReminder = () => {
  if (!hasPermission()) return;
  
  const enabled = localStorage.getItem(KEY_NOTIFICATIONS_ENABLED);
  if (enabled !== 'true') return;

  const last = localStorage.getItem(KEY_LAST_NOTIFIED);
  const now = Date.now();
  // 6 hours in milliseconds. 
  // 24hr / 6hr = 4 slots, but realistic usage implies ~2 notifications per active day.
  const INTERVAL = 6 * 60 * 60 * 1000; 

  if (!last || (now - parseInt(last) > INTERVAL)) {
    const msg = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
    sendNotification("External Brain", msg);
  }
};