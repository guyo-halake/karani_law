export interface ActivityLogItem {
  id: string;
  advocateName: string;
  advocateRole?: string;
  action: string;
  actionDescription?: string;
  actionType?: ActivityLogItem['type'];
  timeAgo: string;
  timestamp: number;
  type: 'feenote' | 'approval' | 'return' | 'permission' | 'login' | 'letter' | 'vault' | 'profile' | 'settings';
  badgeColor: string;
}

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    advocateName: 'Adv. Guyoh Alake',
    advocateRole: 'Managing Partner',
    action: 'authenticated & accessed Executive Oversight Docket',
    timeAgo: 'Just now',
    timestamp: Date.now() - 2 * 60 * 1000,
    type: 'login',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'log-2',
    advocateName: 'Adv. Karani Victor',
    advocateRole: 'Senior Partner',
    action: 'calculated & approved BOC-2026-SEYANI-001 (KES 30,820,193.28)',
    timeAgo: '15 mins ago',
    timestamp: Date.now() - 15 * 60 * 1000,
    type: 'feenote',
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'log-3',
    advocateName: 'Adv. Nyagah Kithinji',
    advocateRole: 'Senior Associate',
    action: 'filed Party & Party Bill of Costs for HCCOMM E547/2024 (KES 405,594.00)',
    timeAgo: '45 mins ago',
    timestamp: Date.now() - 45 * 60 * 1000,
    type: 'approval',
    badgeColor: 'bg-amber-500'
  },
  {
    id: 'log-4',
    advocateName: 'Razak Wako',
    advocateRole: 'Lead Developer',
    action: 'synchronized legal vault spreadsheet: 14.01.2026 - Bill of Costs - Dhanya v Sunil.xlsx',
    timeAgo: '2 hours ago',
    timestamp: Date.now() - 2 * 3600 * 1000,
    type: 'vault',
    badgeColor: 'bg-purple-500'
  },
  {
    id: 'log-5',
    advocateName: 'Adv. Karani Victor',
    advocateRole: 'Senior Partner',
    action: 'verified Schedule 6 ad valorem instruction fee calculation for Seyani v Greenhills',
    timeAgo: '3 hours ago',
    timestamp: Date.now() - 3 * 3600 * 1000,
    type: 'approval',
    badgeColor: 'bg-emerald-500'
  }
];

export const getActivityLogs = (): ActivityLogItem[] => {
  try {
    const saved = localStorage.getItem('SYSTEM_ACTIVITY_LOGS');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(p => p.advocateName === 'Adv. Wanjiku')) {
        return parsed;
      }
    }
  } catch (e) {}
  localStorage.setItem('SYSTEM_ACTIVITY_LOGS', JSON.stringify(INITIAL_LOGS));
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
