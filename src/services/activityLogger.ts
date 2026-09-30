export interface ActivityLogItem {
  id: string;
  advocateName: string;
  advocateRole?: string;
  action: string;
  timeAgo: string;
  timestamp: number;
  type: 'feenote' | 'approval' | 'return' | 'permission' | 'login' | 'letter' | 'vault';
  badgeColor: string;
}

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    advocateName: 'Adv. Wanjiku',
    advocateRole: 'Senior Associate',
    action: 'submitted BOC-2026-007 for Managing Partner sign-off',
    timeAgo: '10 mins ago',
    timestamp: Date.now() - 10 * 60 * 1000,
    type: 'feenote',
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'log-2',
    advocateName: 'Adv. Ochieng',
    advocateRole: 'Associate Advocate',
    action: 'sent a demand letter to Dhanya Construction Kenya Ltd',
    timeAgo: '25 mins ago',
    timestamp: Date.now() - 25 * 60 * 1000,
    type: 'letter',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'log-3',
    advocateName: 'Adv. Kamau',
    advocateRole: 'Junior Associate',
    action: 'logged in from Mombasa IP (197.237.11.4)',
    timeAgo: '45 mins ago',
    timestamp: Date.now() - 45 * 60 * 1000,
    type: 'login',
    badgeColor: 'bg-purple-500'
  },
  {
    id: 'log-4',
    advocateName: 'Adv. Nyagah Kithinji',
    advocateRole: 'Managing Partner',
    action: 'generated Fee Note BOC-2026-SEYANI-001 (KES 30,820,193)',
    timeAgo: '2 hours ago',
    timestamp: Date.now() - 2 * 3600 * 1000,
    type: 'approval',
    badgeColor: 'bg-amber-500'
  }
];

export const getActivityLogs = (): ActivityLogItem[] => {
  try {
    const saved = localStorage.getItem('SYSTEM_ACTIVITY_LOGS');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return INITIAL_LOGS;
};

export const logSystemActivity = (
  advocateName: string,
  action: string,
  type: ActivityLogItem['type'] = 'feenote',
  badgeColor: string = 'bg-emerald-500'
) => {
  const currentLogs = getActivityLogs();
  const newItem: ActivityLogItem = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    advocateName,
    action,
    timeAgo: 'Just now',
    timestamp: Date.now(),
    type,
    badgeColor
  };
  const updated = [newItem, ...currentLogs].slice(0, 50); // Keep last 50 events
  try {
    localStorage.setItem('SYSTEM_ACTIVITY_LOGS', JSON.stringify(updated));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('activityLogsUpdated', { detail: updated }));
  return newItem;
};
