import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Server, HardDrive, Calculator, 
  Briefcase, Settings, LayoutDashboard,
  Search, Bell, Info, Globe, Activity, Database, Edit, Trash2, Eye, Grid, List, LogOut, ChevronDown,
  MapPin, Radio, ShieldAlert, Cpu, ArrowUpRight, CheckCircle2, Clock, Terminal, Zap, Power,
  CheckCircle, GitCommit, GitPullRequest, Layers, HardDriveDownload, Download, RefreshCw, AlertTriangle,
  Plus, Key, Mail, Phone, Lock, MessageSquare, ShieldCheck, FileText, CheckCircle as CheckIcon, AlertOctagon,
  Copy, X, Send, Sliders, ExternalLink, ArrowRight, Shield, Bot, GraduationCap, DollarSign,
  UserCheck, HelpCircle, Code, Play, CheckSquare, BarChart3, TrendingUp, Filter, Hash, UserPlus,
  Kanban, MoveRight, ArrowLeftRight, CheckCheck, Github, Laptop, Smartphone, BookOpen, Video, Calendar,
  FileCode, PlayCircle, FolderArchive, Wifi, RefreshCcw, Sun, Satellite
} from 'lucide-react';
import { supabase, SystemUser, EXACT_FIRM_INFO, getFeeNotes, persistFeeNotes, ExactFeeNoteRecord, EXACT_MATTERS, EXACT_CLIENTS, EXACT_VAULT_FILES } from '../../services/supabase';
import { getLocalTemplates, assignRoleToUser, RoleTemplate } from '../../services/rbac';
import { getActivityLogs, logSystemActivity, ActivityLogItem } from '../../services/activityLogger';
import { fetchFirmUsers, createFirmUser, updateFirmUser, deleteFirmUser } from '../../services/data';

type AdminTab = 
  | 'dashboard'
  | 'projects_clients'
  | 'users_rbac'
  | 'finance_billing'
  | 'ai_infra'
  | 'career_education'
  | 'internal_staff'
  | 'comms_messaging'
  | 'server'
  | 'support_ticketing'
  | 'system_wipe';

interface RealProject {
  id: string;
  name: string;
  repo: string;
  githubUrl: string;
  liveUrl: string;
  client: string;
  clientPhone: string;
  clientEmail: string;
  lead: string;
  category: string;
  status: string;
  contractType: string;
  monthlyFee: string;
  initialPaid: string;
  nextMilestone: string;
  progress: number;
  health: string;
  techStack: string[];
  tasks: string[];
  isRealDb?: boolean;
  mockType?: 'myschools' | 'innercircle' | 'freshcity' | 'sayara' | 'khaemba' | 'suvplanet' | 'odinbot' | 'reload';
}

interface FounderTask {
  id: string;
  title: string;
  category: 'work' | 'personal';
  project?: string;
  priority: 'critical' | 'high' | 'normal';
  completed: boolean;
  dueDate: string;
  notes?: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Uptime
  const [uptimeSeconds, setUptimeSeconds] = useState(1582935);
  useEffect(() => {
    const timer = setInterval(() => setUptimeSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (secs: number) => {
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Live Clock for Real Welcome
  const [currentClock, setCurrentClock] = useState(() => new Date());
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentClock(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const getGreeting = () => {
    const h = currentClock.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedLiveDate = currentClock.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ' · ' + currentClock.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const [apiLatency, setApiLatency] = useState<number>(7);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => localStorage.getItem('BILLSZIP_MAINTENANCE_MODE') === 'true');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedDrawerProject, setSelectedDrawerProject] = useState<RealProject | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'database' | 'tasks'>('overview');
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);

  // Revenue Switcher State
  const [revenuePeriod, setRevenuePeriod] = useState<'this_month' | 'last_6_months' | 'this_year'>('this_month');
  const [workspaceTab, setWorkspaceTab] = useState<'projects' | 'education' | 'server' | 'users'>('projects');
  const [tasksFilter, setTasksFilter] = useState<'work' | 'personal'>('work');

  // REAL KARANI LAW USERS FROM SUPABASE / BACKEND
  const [realUsers, setRealUsers] = useState<SystemUser[]>([]);
  const [isLoadingRealUsers, setIsLoadingRealUsers] = useState(false);

  // New User Form for Karani Law Real Database
  const [showAddRealUserModal, setShowAddRealUserModal] = useState(false);
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Managing Partner' | 'Senior Associate' | 'Associate' | 'Pupil' | 'Billing Clerk'>('Associate');
  const [newUserLskNo, setNewUserLskNo] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Nyagah@2026');

  // WhatsApp Bill Modal
  const [whatsAppModalClient, setWhatsAppModalClient] = useState<{ name: string; amount: string; project: string; message: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real users from Supabase / Backend for Karani Law
  const loadRealUsers = async () => {
    setIsLoadingRealUsers(true);
    try {
      const users = await fetchFirmUsers(EXACT_FIRM_INFO.id);
      setRealUsers(users);
    } catch (e) {
      console.error('Failed to load firm users:', e);
    } finally {
      setIsLoadingRealUsers(false);
    }
  };

  useEffect(() => {
    loadRealUsers();
  }, []);

  // Listen to keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setSelectedDrawerProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real Startup Fleet (from guyo-halake GitHub)
  const [projects, setProjects] = useState<RealProject[]>([
    {
      id: 'prj-karani-law',
      name: 'Karani Law & Bills of Costs ERP',
      repo: 'guyo-halake/nyagakithinji-Bill-of-Costs',
      githubUrl: 'https://github.com/guyo-halake/nyagakithinji-Bill-of-Costs',
      liveUrl: 'https://karani-law.vercel.app',
      client: 'Adv. Nyagah B. Kithinji',
      clientPhone: '+254 (0)20 271 8900',
      clientEmail: 'advocate@kithinjilegal.co.ke',
      lead: 'Guyoh Halake',
      category: 'LegalTech ERP',
      status: 'Live (Real Database)',
      contractType: 'Milestone Retainer',
      monthlyFee: 'Milestone Retainer',
      initialPaid: 'Milestone Billing',
      nextMilestone: 'Finalize Schedule 6 statutory calculation engine & Azure ACR multi-container rollout',
      progress: 78,
      health: '200 OK (Azure App Service)',
      techStack: ['TypeScript', 'React', 'FastAPI', 'Docker', 'Azure ACR', 'Supabase'],
      isRealDb: true,
      tasks: [
        'Finalize Schedule 6 statutory calculation engine & test bench',
        'Verify Azure App Service multi-container Docker compose',
        'Conduct advocate UAT walkthrough for fee notes and Bills of Costs'
      ]
    },
    {
      id: 'prj-myschools',
      name: 'mySchools CBC School Management',
      repo: 'guyo-halake/mySchools-',
      githubUrl: 'https://github.com/guyo-halake/mySchools-',
      liveUrl: 'https://p3lschools.vercel.app/',
      client: 'P3L EdTech Division',
      clientPhone: '+254 700 000 000',
      clientEmail: 'edtech@p3ldev.com',
      lead: 'Guyoh Halake',
      category: 'EdTech ERP',
      status: 'Live (Vercel)',
      contractType: 'SaaS Subscription',
      monthlyFee: 'KES 15,000 / term',
      initialPaid: 'KES 45,000',
      nextMilestone: 'CBC Grade 4-8 automated assessment export & SMS gateway integration',
      progress: 90,
      health: '200 OK (Vercel Edge)',
      techStack: ['Next.js', 'React', 'Tailwind', 'RAG LLM', 'WhatsApp API'],
      mockType: 'myschools',
      tasks: [
        'Connect RAG LLM to Kenyan CBC curriculum guidelines',
        'Test automated WhatsApp fee receipt generation'
      ]
    },
    {
      id: 'prj-fresh-city',
      name: 'Fresh City Supermarket POS',
      repo: 'guyo-halake/POS_Frontend',
      githubUrl: 'https://github.com/guyo-halake/POS_Frontend',
      liveUrl: 'Station POS-01 (In Store)',
      client: 'Rosemary Wakonyo',
      clientPhone: '+254 756111885',
      clientEmail: 'Direct Phone / In-Store',
      lead: 'Guyoh Halake',
      category: 'Retail & POS',
      status: 'Live (In Store)',
      contractType: 'SoftwareRetainer',
      monthlyFee: 'KES 3,500 / mo',
      initialPaid: 'KES 32,000',
      nextMilestone: 'Monthly barcode inventory reconciliation & thermal cut audit',
      progress: 100,
      health: 'Active (Offline SQLite)',
      techStack: ['Electron', 'React', 'SQLite', 'Thermal Printer Bridge'],
      mockType: 'freshcity',
      tasks: [
        'Reconcile end-of-month barcode inventory batch',
        'Verify thermal printer automatic paper cut daemon',
        'Inspect offline SQLite ledger synchronization'
      ]
    },
    {
      id: 'prj-sayara-ecom',
      name: 'Sayara Aesthetics & Shein Sync',
      repo: 'guyo-halake/sayara_aesthetics-e-shop',
      githubUrl: 'https://github.com/guyo-halake/sayara_aesthetics-e-shop',
      liveUrl: 'https://sayara-aesthetics.vercel.app',
      client: 'Sarah Guyatu Rashid',
      clientPhone: '+254 114 807 215',
      clientEmail: 'sarahguyatu2@gmail.com',
      lead: 'Guyoh Halake',
      category: 'E-commerce',
      status: 'Live (Vercel & Python)',
      contractType: 'SoftwareRetainer',
      monthlyFee: '% Commission + Maintenance',
      initialPaid: 'KES 10,000',
      nextMilestone: 'Seasonal beauty catalog sync & USD-to-KES currency multiplier',
      progress: 100,
      health: '200 OK & Worker Port 8040',
      techStack: ['Next.js', 'Python 3.11', 'Playwright', 'FastAPI'],
      mockType: 'sayara',
      tasks: [
        'Test Shein product price margin formula',
        'Review Vercel Edge cache hit ratio and load times',
        'Verify M-Pesa automated checkout callback'
      ]
    },
    {
      id: 'prj-inner-circle',
      name: 'Inner Circle Hedge Fund Platform',
      repo: 'guyo-halake/Inner-Circle---Frontend',
      githubUrl: 'https://github.com/guyo-halake/Inner-Circle---Frontend',
      liveUrl: 'https://inner-circlehedegfund.vercel.app',
      client: 'Inner Circle Capital Partners',
      clientPhone: '+254 711 000 000',
      clientEmail: 'invest@innercircle.co.ke',
      lead: 'Guyoh Halake',
      category: 'FinTech Wealth',
      status: 'Live (Vercel)',
      contractType: 'Asset Management Fee',
      monthlyFee: '1.5% AUM Fee',
      initialPaid: 'KES 120,000',
      nextMilestone: 'Tiered investor KYC verification & cumulative yield ledger',
      progress: 85,
      health: '200 OK (Vercel Edge)',
      techStack: ['TypeScript', 'React', 'Node.js', 'Mobile App'],
      mockType: 'innercircle',
      tasks: [
        'Rebalance weekly asset portfolio allocation weights',
        'Verify multi-tier investor returns calculation engine'
      ]
    },
    {
      id: 'prj-khaemba-news',
      name: 'Khaemba News & Media Platform',
      repo: 'guyo-halake/Khaemba_news_platform',
      githubUrl: 'https://github.com/guyo-halake/Khaemba_news_platform',
      liveUrl: 'https://khaemba-news-platform.vercel.app',
      client: 'D K Media & Productions',
      clientPhone: '+254 722 000 000',
      clientEmail: 'editorial@khaembanews.com',
      lead: 'Guyoh Halake',
      category: 'Media & News',
      status: 'Live (Vercel)',
      contractType: 'SoftwareRetainer',
      monthlyFee: 'KES 5,000 / mo',
      initialPaid: 'KES 25,000',
      nextMilestone: 'Video CDN streaming optimization & journalist contributor portal',
      progress: 95,
      health: '200 OK (Vercel Edge)',
      techStack: ['TypeScript', 'React', 'Tailwind', 'Video CDN'],
      mockType: 'khaemba',
      tasks: [
        'Streamline video documentary encoding pipeline',
        'Review editor article drafting permissions'
      ]
    },
    {
      id: 'prj-suvplanet',
      name: 'SUVPlanet Automotive Marketplace',
      repo: 'guyo-halake/suvplane',
      githubUrl: 'https://github.com/guyo-halake/suvplane',
      liveUrl: 'https://suvplanet.vercel.app',
      client: 'SUVPlanet Auto Traders',
      clientPhone: '+254 733 000 000',
      clientEmail: 'sales@suvplanet.co.ke',
      lead: 'Guyoh Halake',
      category: 'Automotive Marketplace',
      status: 'Live (Vercel)',
      contractType: 'Listing Retainer',
      monthlyFee: 'Listing Commission',
      initialPaid: 'KES 30,000',
      nextMilestone: 'Vehicle inspection reports & automated WhatsApp test-drive booking',
      progress: 90,
      health: '200 OK (Vercel Edge)',
      techStack: ['TypeScript', 'React', 'Next.js'],
      mockType: 'suvplanet',
      tasks: [
        'Add WhatsApp click-to-chat on vehicle listing cards',
        'Update showroom inventory status badges'
      ]
    },
    {
      id: 'prj-odinbot',
      name: 'Matta- AI & OdinBot Assistant',
      repo: 'guyo-halake/Matta-',
      githubUrl: 'https://github.com/guyo-halake/Matta-',
      liveUrl: 'https://odinbot.p3ldev.com',
      client: 'P3L Internal R&D',
      clientPhone: '+254 700 000 000',
      clientEmail: 'p3lcodes@gmail.com',
      lead: 'Guyoh Halake',
      category: 'AI & Automation',
      status: 'Debugging (API Issue)',
      contractType: 'Internal R&D',
      monthlyFee: 'KES 0',
      initialPaid: 'KES 0',
      nextMilestone: 'Resolve razak-server/mirrors/api/kenyanbanks/IandM endpoint',
      progress: 45,
      health: 'Degraded (Mirror 502)',
      techStack: ['Python', 'LangChain', 'FastAPI', 'pgvector', 'Ollama'],
      mockType: 'odinbot',
      tasks: [
        'Fix I&M Bank mirror connection error in razak-server/mirrors/api/kenyanbanks/IandM',
        'Re-bind mirror socket to port 8082 with retry circuit breaker'
      ]
    },
    {
      id: 'prj-reload-infra',
      name: 'System Wipe & Server Recovery (reload.sh)',
      repo: 'guyo-halake/reload.sh',
      githubUrl: 'https://github.com/guyo-halake/reload.sh',
      liveUrl: 'razak-server Marsabit Node',
      client: 'P3L Infrastructure',
      clientPhone: '—',
      clientEmail: '—',
      lead: 'Guyoh Halake',
      category: 'Infrastructure & Tools',
      status: 'Active (Local SSH)',
      contractType: 'Internal Tools',
      monthlyFee: 'Internal',
      initialPaid: 'Internal',
      nextMilestone: 'Automated zero-downtime Linux reinstall script over SSH',
      progress: 100,
      health: 'Operational',
      techStack: ['Bash', 'Linux GNU', 'SSH', 'razak-server'],
      mockType: 'reload',
      tasks: ['Zero-downtime Linux reinstall script verified']
    }
  ]);

  // Mock database stores for non-Karani projects
  const [mockMySchools, setMockMySchools] = useState([
    { id: 'stu-101', nemisNo: 'NM-948201', name: 'Brian Kiprop', grade: 'Grade 5 CBC', parentPhone: '+254 721 883 912', termFee: 'KES 18,500', status: 'Cleared' },
    { id: 'stu-102', nemisNo: 'NM-948202', name: 'Amina Halake', grade: 'Grade 6 CBC', parentPhone: '+254 711 405 821', termFee: 'KES 18,500', status: 'Pending KES 4,000' },
    { id: 'stu-103', nemisNo: 'NM-948203', name: 'Kelvin Mwangi', grade: 'Grade 4 CBC', parentPhone: '+254 734 910 223', termFee: 'KES 16,000', status: 'Cleared' }
  ]);

  const [mockInnerCircle, setMockInnerCircle] = useState([
    { id: 'inv-01', name: 'Dr. Hassan Abdi', tier: 'Private Wealth', deposit: 'KES 5,000,000', monthlyYield: '+3.4%', kycStatus: 'Verified' },
    { id: 'inv-02', name: 'Faith Cherotich', tier: 'Gold Tier', deposit: 'KES 1,200,000', monthlyYield: '+3.4%', kycStatus: 'Verified' },
    { id: 'inv-03', name: 'Peter Omondi', tier: 'Silver Tier', deposit: 'KES 500,000', monthlyYield: '+3.1%', kycStatus: 'Under Review' }
  ]);

  const [mockFreshCity, setMockFreshCity] = useState([
    { id: 'pos-1', cashier: 'Rosemary Wakonyo', register: 'Lane 01 (Main POS)', shift: 'Morning / Afternoon', cashDrawer: 'KES 42,850', printerStatus: 'Thermal Auto-Cut OK' },
    { id: 'pos-2', cashier: 'Grace Njeri', register: 'Lane 02 (Express)', shift: 'Evening Shift', cashDrawer: 'KES 18,300', printerStatus: 'Ready' }
  ]);

  const [mockSayara, setMockSayara] = useState([
    { id: 'sku-01', title: 'Velvet Matte Lip Glaze #04', sheinSku: 'SH-BEAUTY-9921', costUsd: '$2.40', priceKes: 'KES 850', margin: '62%', lastSync: '14 Oct, 08:30' },
    { id: 'sku-02', title: 'Collagen Hydrating Night Serum', sheinSku: 'SH-SKIN-4019', costUsd: '$4.10', priceKes: 'KES 1,450', margin: '58%', lastSync: '14 Oct, 08:30' },
    { id: 'sku-03', title: 'Waterproof Volumizing Mascara', sheinSku: 'SH-EYE-1102', costUsd: '$1.80', priceKes: 'KES 650', margin: '65%', lastSync: '14 Oct, 08:30' }
  ]);

  const [mockKhaemba, setMockKhaemba] = useState([
    { id: 'art-01', headline: 'Marsabit Wind Power: Powering the Northern Corridor', author: 'Dennis Khaemba', category: 'Energy & Climate', views: '14,200', status: 'Published' },
    { id: 'art-02', headline: 'The Lake Turkana Fisherfolk Documentary: Episode 2', author: 'Documentary Desk', category: 'Documentary Video', views: '8,950', status: 'Streaming' }
  ]);

  const [mockSuvPlanet, setMockSuvPlanet] = useState([
    { id: 'car-01', model: 'Toyota Land Cruiser Prado TX-L 2020', reg: 'KDG 482M', price: 'KES 6,850,000', status: 'Available in Showroom', leads: 9 },
    { id: 'car-02', model: 'Subaru Outback 2.5i Limited 2018', reg: 'KDD 193A', price: 'KES 3,250,000', status: 'Test Drive Booked', leads: 14 }
  ]);

  // Tasks
  const [tasks, setTasks] = useState<FounderTask[]>([
    {
      id: 'tsk-01',
      title: 'Karani Law ERP: Complete statutory court taxation calculations and multi-container build',
      category: 'work',
      project: 'Karani Law & Bills of Costs ERP',
      priority: 'high',
      completed: false,
      dueDate: 'Today, 17:00'
    },
    {
      id: 'tsk-02',
      title: 'Sayara Aesthetics: Check automated product margins and scraper catalog sync',
      category: 'work',
      project: 'Sayara Aesthetics & Shein Sync',
      priority: 'normal',
      completed: false,
      dueDate: 'Today, 19:30'
    },
    {
      id: 'tsk-03',
      title: 'OdinBot AI: Restart bank mirror socket on port 8082 for I&M Bank',
      category: 'work',
      project: 'Matta- AI & OdinBot Assistant',
      priority: 'critical',
      completed: false,
      dueDate: 'Urgent'
    },
    {
      id: 'tsk-04',
      title: 'Fresh City POS: Check thermal receipt auto-cutter and end-of-day register batch',
      category: 'work',
      project: 'Fresh City Supermarket POS',
      priority: 'normal',
      completed: true,
      dueDate: 'Yesterday'
    },
    {
      id: 'tsk-05',
      title: 'Distributed Systems Coursework: Complete Consensus Assignment 3',
      category: 'personal',
      priority: 'high',
      completed: false,
      dueDate: 'Friday'
    }
  ]);

  // Coursework
  const [coursework] = useState([
    { id: 'cw-1', subject: 'Distributed Systems', title: 'Assignment 3: Consensus & Partitioning', deadline: 'In 3 days', status: 'In Progress', marks: 'Pending' },
    { id: 'cw-2', subject: 'Database Systems', title: 'Lab 4: B-Tree Indexing & Query Optimizations', deadline: 'Completed', status: 'Submitted', marks: '92 / 100' },
    { id: 'cw-3', subject: 'Software Engineering', title: 'Milestone 2: Architecture & Specification', deadline: 'Submitted', status: 'Graded', marks: '88 / 100' }
  ]);

  const [serverDaemons] = useState([
    { pid: 1024, name: 'fastapi-backend', port: 8000, cpu: '1.2%', memory: '180 MB', uptime: '18d 07h', status: 'Running' },
    { pid: 1088, name: 'vite-frontend', port: 3000, cpu: '0.4%', memory: '95 MB', uptime: '18d 07h', status: 'Running' },
    { pid: 2042, name: 'sayara-shein-daemon', port: 8040, cpu: '2.1%', memory: '210 MB', uptime: '14d 12h', status: 'Running' },
    { pid: 3012, name: 'odinbot-core-agent', port: 8080, cpu: '5.8%', memory: '450 MB', uptime: '3d 04h', status: 'Degraded' },
    { pid: 4099, name: 'postgresql-pool', port: 5432, cpu: '1.0%', memory: '320 MB', uptime: '18d 07h', status: 'Running' }
  ]);

  // Handlers
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    showToast('Task updated.');
  };

  const handleCreateRealUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserFullName.trim() || !newUserEmail.trim()) {
      showToast('Please enter full name and email.');
      return;
    }

    try {
      const created = await createFirmUser(EXACT_FIRM_INFO.id, {
        fullName: newUserFullName.trim(),
        workEmail: newUserEmail.trim(),
        role: newUserRole,
        position: newUserRole,
        lskNo: newUserLskNo.trim() || `P105/${Math.floor(10000 + Math.random() * 90000)}/26`,
        passwordHash: newUserPassword.trim() || 'Nyagah@2026',
        advocateTitle: `Adv. ${newUserFullName.trim()}`
      });

      setRealUsers(prev => [created, ...prev]);
      setShowAddRealUserModal(false);
      setNewUserFullName('');
      setNewUserEmail('');
      setNewUserLskNo('');
      showToast(`User ${created.fullName} saved to database. They can now log in.`);
    } catch (err) {
      showToast('Error creating user. Check database logs.');
    }
  };

  const handleDeleteRealUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the database?`)) return;
    try {
      await deleteFirmUser(EXACT_FIRM_INFO.id, userId);
      setRealUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`${userName} removed from database.`);
    } catch (err) {
      showToast('Failed to delete user.');
    }
  };

  const handleOpenWhatsAppBill = (clientName: string, amount: string, project: string) => {
    const msg = `Hello ${clientName}, hope all is well. This is a gentle note regarding the monthly software maintenance retainer for ${project} of KES ${amount} for this month. Bank / M-Pesa details: Biftu Construction Co. (P3L Developers). Thank you!`;
    setWhatsAppModalClient({ name: clientName, amount, project, message: msg });
  };

  const copyWhatsAppText = () => {
    if (whatsAppModalClient?.message) {
      navigator.clipboard.writeText(whatsAppModalClient.message);
      showToast('WhatsApp bill copied to clipboard!');
    }
  };

  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      organization: 'P3L Developers (subsidiary Biftu Construction Company, Marsabit)',
      founder: 'Guyoh Halake',
      server: 'razak-server',
      station: 'Marsabit County, Kenya',
      projects,
      realUsers,
      tasks
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `p3l_master_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Snapshot downloaded.');
  };

  const navItems: Array<{ id: AdminTab; label: string; icon: any; count?: number; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects_clients', label: 'Projects & Clients', icon: Briefcase, count: projects.length },
    { id: 'users_rbac', label: 'Users & RBAC', icon: Users, count: realUsers.length || 5 },
    { id: 'finance_billing', label: 'Finance & Billing', icon: DollarSign, badge: 'KES 8,000' },
    { id: 'ai_infra', label: 'AI & Infrastructure', icon: Bot, badge: 'OdinBot' },
    { id: 'career_education', label: 'Career & Education', icon: GraduationCap, count: 3 },
    { id: 'internal_staff', label: 'Internal P3L Staff', icon: UserCheck, count: 3 },
    { id: 'comms_messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'server', label: 'Razak Server', icon: Cpu, badge: '7 ms' },
    { id: 'support_ticketing', label: 'Support & Ticketing', icon: HelpCircle },
    { id: 'system_wipe', label: 'System Wipes', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#f8fafc] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR: P3L DEVELOPERS (NO GO-TO-KARANI LINK) */}
      {/* ========================================================================= */}
      <aside className="w-64 flex flex-col py-4 px-3 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs z-20 shrink-0">
        
        {/* Brand Header with Logo */}
        <div className="px-2 pb-3.5 mb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
              <img 
                src="/p3l_logo.jpeg" 
                alt="P3L" 
                className="w-full h-full object-contain p-0.5"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight truncate">
                P3L Developers
              </p>
              <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-mono truncate leading-tight mt-0.5">
                subsidiary Biftu Construction Co.
              </p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="System Online"></span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-1 flex-1 w-full overflow-y-auto pr-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 py-1 font-mono">
            Company Pillars
          </span>
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const isActive = activeTab === nav.id;
            return (
              <button 
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs font-bold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{nav.label}</span>
                </div>
                {nav.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                    isActive ? 'bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {nav.count}
                  </span>
                )}
                {nav.badge && (
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    isActive ? 'bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-900' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {nav.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Clean Server Node Status */}
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-between text-[10.5px] font-mono">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              razak-server
            </span>
            <span className="text-zinc-900 dark:text-white font-bold">{apiLatency} ms</span>
          </div>
          <div className="px-3 py-1 text-[10px] text-zinc-400 font-mono text-center">
            Branch: update-4 · Marsabit Node
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Command Bar (Seamless, Borderless, Floating) */}
        <header className="px-8 py-3.5 w-full flex justify-between items-center bg-transparent z-10">
          <div className="flex items-center gap-5 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden border border-amber-500/30 shadow-xs">
                <img src="/p3l_logo.jpeg" alt="P3L" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100 block leading-tight">
                  P3L Developers
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block leading-tight truncate">
                  subsidiary Biftu Construction Company, Marsabit
                </span>
              </div>
            </div>

            {/* Omni-Search Box with Ctrl+K trigger */}
            <div 
              onClick={() => setShowCommandPalette(true)}
              className="relative hidden md:flex items-center w-72 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-xs text-zinc-400 cursor-pointer hover:border-amber-500/40 transition-colors shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 mr-2 text-zinc-400" />
              <span className="truncate">Search projects, database, tasks...</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Right Top Status Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Satellite className="w-3 h-3 text-amber-500" />
                <span>Starlink 38ms</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Server OK</span>
              </span>
            </div>

            <button
              onClick={() => showToast('All services operational in Marsabit.')}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 cursor-pointer transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Founder Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center font-mono">
                GH
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hidden lg:inline">
                Guyoh Halake
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Work Canvas with subtle warm orange tint at low opacity */}
        <main 
          className="flex-1 overflow-y-auto px-8 py-5 pb-20"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.025)' }}
        >
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ========================================================================= */}
            {/* REAL, HUMAN WELCOME SECTION WITH LIVE TIME */}
            {/* ========================================================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/70 dark:border-zinc-800/70">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {getGreeting()}, Guyo
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Marsabit Station Online
                  </span>
                </div>
                
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {formattedLiveDate}
                </p>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-normal">
                  Welcome back to P3L Developers. Your 8 startup projects and databases are running smoothly today.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const karani = projects.find(p => p.id === 'prj-karani-law');
                    if (karani) {
                      setSelectedDrawerProject(karani);
                      setDrawerTab('database');
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Karani Law Users</span>
                </button>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Add Task</span>
                </button>

                <button
                  onClick={handleExportBackup}
                  className="p-2.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-amber-600 text-xs transition-colors cursor-pointer"
                  title="Download Backup Snapshot"
                >
                  <Download className="w-3.5 h-3.5 stroke-[1.75]" />
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* MARSABIT STARLINK & INFRASTRUCTURE TELEMETRY RIBBON */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <Satellite className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Starlink Uplink</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">38 ms · 185 Mbps</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Station Power</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">96% Solar · 220V</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">razak-server</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">24°C · 14% Load</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">LTE Failover</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Safaricom Standby</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DASHBOARD TAB OVERVIEW */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* CARD 1: INCOME & REVENUE */}
                  <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                          Income &amp; Revenue
                        </span>
                        
                        <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 text-[10.5px] font-medium">
                          <button
                            onClick={() => setRevenuePeriod('this_month')}
                            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                              revenuePeriod === 'this_month' 
                                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-xs' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            Month
                          </button>
                          <button
                            onClick={() => setRevenuePeriod('last_6_months')}
                            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                              revenuePeriod === 'last_6_months' 
                                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-xs' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            6 Mo
                          </button>
                          <button
                            onClick={() => setRevenuePeriod('this_year')}
                            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                              revenuePeriod === 'this_year' 
                                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-xs' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            Year
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
                          {revenuePeriod === 'this_month' ? 'KES 8,000' : revenuePeriod === 'last_6_months' ? 'KES 43,000' : 'KES 85,000'}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
                          {revenuePeriod === 'this_month' 
                            ? 'KES 3,200 received from Sarah Rashid (Sayara store)' 
                            : revenuePeriod === 'last_6_months'
                            ? 'KES 43,000 collected over the last 6 months'
                            : 'Total startup revenue across all client retainers'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                        <span>Fresh City POS:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-900 dark:text-zinc-200">KES 3,500/mo</span>
                          <button 
                            onClick={() => handleOpenWhatsAppBill('Rosemary Wakonyo', '3,500', 'Fresh City POS')}
                            className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                        <span>Sayara Aesthetics:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-900 dark:text-zinc-200">% Commission</span>
                          <button 
                            onClick={() => handleOpenWhatsAppBill('Sarah Guyatu Rashid', '3,200', 'Sayara Aesthetics')}
                            className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                        <span>Karani Law System:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-900 dark:text-zinc-200">Milestone</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Real DB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: ACTIVE WEBSITES & APPS */}
                  <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                          Active Fleet
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          8 Projects Live
                        </span>
                      </div>

                      <div className="mt-3 space-y-2.5 text-xs">
                        {projects.slice(0, 3).map(p => (
                          <div 
                            key={p.id}
                            onClick={() => setSelectedDrawerProject(p)}
                            className="flex items-center justify-between py-1 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 px-2 rounded-lg transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 block truncate group-hover:underline">
                                {p.name}
                              </span>
                              <span className="text-[10.5px] text-zinc-400 font-mono block truncate">
                                {p.client} &middot; {p.category}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {p.isRealDb ? 'Real DB' : 'Live'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10.5px] font-mono text-zinc-400 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                      Click any project to inspect its database and users
                    </p>
                  </div>

                  {/* CARD 3: TODAY'S PRIORITIES */}
                  <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                          Things to do today
                        </span>
                        
                        <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 text-[10.5px] font-medium">
                          <button
                            onClick={() => setTasksFilter('work')}
                            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                              tasksFilter === 'work' 
                                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-xs' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            Work
                          </button>
                          <button
                            onClick={() => setTasksFilter('personal')}
                            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                              tasksFilter === 'personal' 
                                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-xs' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            Personal
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {tasksFilter === 'work' ? (
                          <>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">Karani Law ERP</span>
                                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">78%</span>
                              </div>
                              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '78%' }}></div>
                              </div>
                              <span className="text-[10px] text-zinc-400 block font-mono">
                                Finishing Schedule 6 court calculation tests
                              </span>
                            </div>

                            <div 
                              onClick={() => toggleTask('tsk-02')}
                              className="flex items-start gap-2.5 pt-0.5 cursor-pointer group"
                            >
                              <input 
                                type="checkbox" 
                                checked={tasks.find(t => t.id === 'tsk-02')?.completed} 
                                onChange={() => {}} 
                                className="rounded mt-0.5 cursor-pointer accent-amber-500 w-3.5 h-3.5" 
                              />
                              <div className="text-xs min-w-0">
                                <span className="font-medium text-zinc-800 dark:text-zinc-200 block truncate group-hover:text-zinc-950 dark:group-hover:text-white">
                                  Check Shein product prices and margins
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">Due today, 7:30 PM</span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-xs">
                              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                                <span>Needs attention: OdinBot mirror port 8082</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            {tasks.filter(t => t.category === 'personal').slice(0, 3).map(t => (
                              <div 
                                key={t.id}
                                onClick={() => toggleTask(t.id)}
                                className="flex items-start gap-2 cursor-pointer text-xs"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={t.completed} 
                                  onChange={() => {}} 
                                  className="rounded mt-0.5 cursor-pointer accent-amber-500 w-3.5 h-3.5" 
                                />
                                <div className="min-w-0">
                                  <span className={`block truncate ${t.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                    {t.title}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono">{t.dueDate}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center text-[10.5px] font-mono text-zinc-400">
                      <span>Tasks: {tasks.filter(t => t.completed).length}/{tasks.length} done</span>
                      <button 
                        onClick={() => setShowAddTaskModal(true)} 
                        className="text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>
                  </div>

                </div>

                {/* ========================================================================= */}
                {/* PROJECTS TABLE & REPO WORKSPACE */}
                {/* ========================================================================= */}
                <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 gap-3">
                    <div>
                      <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        Project Fleet &amp; Client CRM
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        GitHub fleet: Karani Law (Real Database), mySchools, Fresh City POS, Sayara, Inner Circle, Khaemba, SUVPlanet
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddProjectModal(true)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>New Project</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10.5px] uppercase font-mono text-zinc-400 tracking-wider">
                          <th className="py-2.5 px-3 font-medium">Project</th>
                          <th className="py-2.5 px-3 font-medium">Client</th>
                          <th className="py-2.5 px-3 font-medium">Database</th>
                          <th className="py-2.5 px-3 font-medium">Fee / Retainer</th>
                          <th className="py-2.5 px-3 font-medium">Status</th>
                          <th className="py-2.5 px-3 text-right font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                        {projects.map(p => (
                          <tr key={p.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors group">
                            <td className="py-3 px-3">
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 block font-sans">{p.name}</span>
                              <span className="text-[10px] text-zinc-400">{p.repo}</span>
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <span className="text-zinc-800 dark:text-zinc-200 block">{p.client}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">{p.clientPhone}</span>
                            </td>
                            <td className="py-3 px-3">
                              {p.isRealDb ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <Database className="w-3 h-3 text-amber-500" />
                                  Real Supabase DB
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                  Mock Studio DB
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 block">{p.monthlyFee}</span>
                              <span className="text-[10px] text-zinc-400">{p.contractType}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1.5 text-[10.5px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${p.status.includes('Live') ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button 
                                onClick={() => setSelectedDrawerProject(p)}
                                className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-black cursor-pointer shadow-2xs"
                              >
                                {p.isRealDb ? 'Manage Users' : 'Database Studio'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* OTHER AUTHORITATIVE TABS */}
            {/* ========================================================================= */}
            {activeTab === 'projects_clients' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
                      Projects Fleet &amp; Client CRM
                    </h2>
                    <p className="text-xs text-zinc-500">
                      8 active client and research repositories connected to P3L OS
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddProjectModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer shadow-xs"
                  >
                    + Add New Project
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            {p.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{p.name}</h3>
                        <p className="text-xs text-zinc-500">Client: <strong>{p.client}</strong></p>
                        <p className="text-[11px] font-mono text-zinc-400">Rate: {p.monthlyFee}</p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 pt-1">Milestone: {p.nextMilestone}</p>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-400">{p.isRealDb ? 'Real Supabase' : 'Mock Studio'}</span>
                        <button 
                          onClick={() => setSelectedDrawerProject(p)}
                          className="px-3 py-1 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-[10.5px] cursor-pointer"
                        >
                          Open Dossier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users_rbac' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
                      Access Control &amp; RBAC (Karani Law Database)
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Live accounts currently provisioned in Supabase and PostgreSQL
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddRealUserModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer shadow-xs"
                  >
                    + Add User to Database
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {realUsers.map(u => (
                    <div key={u.id} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block font-sans">{u.fullName}</span>
                        <span className="text-[10px] text-zinc-400">{u.workEmail} &middot; LSK: {u.lskNo || 'Advocate'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          {u.role}
                        </span>
                        <button 
                          onClick={() => handleDeleteRealUser(u.id, u.fullName)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete user from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'finance_billing' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
                    Finance &amp; Retainer Billing
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Startup cashflow, client retainers, and 1-click WhatsApp payment reminders
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">This Month Collected</span>
                    <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">KES 8,000</p>
                    <p className="text-xs text-zinc-500 mt-1">Sarah Rashid: KES 3,200</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Pending Invoices</span>
                    <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">KES 3,500</p>
                    <p className="text-xs text-zinc-500 mt-1">Fresh City POS due in 12 days</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Milestone Retainers</span>
                    <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">Active</p>
                    <p className="text-xs text-zinc-500 mt-1">Karani Law &amp; Inner Circle</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-xs uppercase font-mono text-zinc-400">1-Click WhatsApp Client Bills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-white block">Rosemary Wakonyo</span>
                        <span className="text-[10.5px] text-zinc-400 font-mono">Fresh City POS &middot; KES 3,500 / mo</span>
                      </div>
                      <button 
                        onClick={() => handleOpenWhatsAppBill('Rosemary Wakonyo', '3,500', 'Fresh City POS')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer shadow-xs"
                      >
                        Draft WhatsApp Bill
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-white block">Sarah Guyatu Rashid</span>
                        <span className="text-[10.5px] text-zinc-400 font-mono">Sayara Aesthetics &middot; KES 3,200</span>
                      </div>
                      <button 
                        onClick={() => handleOpenWhatsAppBill('Sarah Guyatu Rashid', '3,200', 'Sayara Aesthetics')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer shadow-xs"
                      >
                        Draft WhatsApp Bill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system_wipe' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
                    System Wipes &amp; Emergency Recovery (reload.sh)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Repository: guyo-halake/reload.sh &middot; Bare-metal Linux reinstall and snapshot recovery
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs font-mono">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Emergency System Kill-Switch &amp; Lockdown</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    Locks down client access to read-only mode with a maintenance screen while leaving founder access active.
                  </p>
                  <button 
                    onClick={() => {
                      const next = !isMaintenanceMode;
                      setIsMaintenanceMode(next);
                      localStorage.setItem('BILLSZIP_MAINTENANCE_MODE', String(next));
                      showToast(next ? 'Emergency Lockdown Active.' : 'Platform restored.');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isMaintenanceMode ? 'bg-rose-600 text-white animate-pulse' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    }`}
                  >
                    {isMaintenanceMode ? 'Kill-Switch Engaged (Click to Disable)' : 'Engage Emergency Kill-Switch'}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-xs uppercase font-mono text-zinc-400">Master Database Snapshot</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Download an encrypted complete snapshot of all users, retainers, and tasks.
                  </p>
                  <button 
                    onClick={handleExportBackup}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer shadow-xs"
                  >
                    Download Master Snapshot (.json)
                  </button>
                </div>
              </div>
            )}

            {/* Other tabs render default views */}
            {['ai_infra', 'career_education', 'internal_staff', 'comms_messaging', 'server', 'support_ticketing'].includes(activeTab) && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 animate-fadeIn">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white capitalize">
                  {activeTab.replace('_', ' ')}
                </h3>
                <p className="text-xs text-zinc-500">
                  Marsabit County Operations Node &middot; Live server metrics and operational controls active.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER MULTI-TENANT PROJECT DRAWER (REAL DB FOR KARANI VS MOCK STUDIO) */}
      {/* ========================================================================= */}
      {selectedDrawerProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    {selectedDrawerProject.name}
                  </h2>
                  {selectedDrawerProject.isRealDb ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-zinc-950">
                      Real Database
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      Mock Studio DB
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Repo: {selectedDrawerProject.repo}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDrawerProject(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-5 text-xs font-semibold gap-4">
              <button
                onClick={() => setDrawerTab('overview')}
                className={`py-3 border-b-2 cursor-pointer transition-colors ${
                  drawerTab === 'overview' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Overview &amp; Retainer
              </button>
              <button
                onClick={() => setDrawerTab('database')}
                className={`py-3 border-b-2 cursor-pointer transition-colors ${
                  drawerTab === 'database' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {selectedDrawerProject.isRealDb ? 'Firm Users (Real Database)' : 'Database Studio'}
              </button>
              <button
                onClick={() => setDrawerTab('tasks')}
                className={`py-3 border-b-2 cursor-pointer transition-colors ${
                  drawerTab === 'tasks' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Milestones &amp; Tasks
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {drawerTab === 'overview' && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-400 uppercase font-mono text-[10px]">Client Account</span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedDrawerProject.client}</p>
                    <p className="text-zinc-500 font-mono">Phone: {selectedDrawerProject.clientPhone}</p>
                    <p className="text-zinc-500 font-mono">Email: {selectedDrawerProject.clientEmail}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-400 uppercase font-mono text-[10px]">Contract &amp; Billing</span>
                    <p className="text-zinc-800 dark:text-zinc-200">Rate: <strong>{selectedDrawerProject.monthlyFee}</strong></p>
                    <p className="text-zinc-800 dark:text-zinc-200">Initial Paid: <strong>{selectedDrawerProject.initialPaid}</strong></p>
                    <p className="text-zinc-800 dark:text-zinc-200">Agreement: <strong>{selectedDrawerProject.contractType}</strong></p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono">
                    <span className="font-bold text-zinc-400 uppercase text-[10px]">Tech Stack &amp; Links</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedDrawerProject.techStack.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 flex gap-3">
                      <a href={selectedDrawerProject.githubUrl} target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">
                        GitHub Repo &rarr;
                      </a>
                      <a href={selectedDrawerProject.liveUrl} target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">
                        Production URL &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'database' && (
                <div className="space-y-4">
                  {selectedDrawerProject.isRealDb ? (
                    // REAL DATABASE FOR KARANI LAW
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300 block">Connected to Live Supabase DB</span>
                          <span className="text-[10.5px] text-amber-700 dark:text-amber-400 font-mono">
                            Users created here can immediately log in to the portal.
                          </span>
                        </div>
                        <button 
                          onClick={() => setShowAddRealUserModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-xs"
                        >
                          + Add Real User
                        </button>
                      </div>

                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400">
                            <tr>
                              <th className="p-2.5">Name</th>
                              <th className="p-2.5">Email</th>
                              <th className="p-2.5">Role</th>
                              <th className="p-2.5">LSK No</th>
                              <th className="p-2.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {realUsers.map(u => (
                              <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-white">{u.fullName}</td>
                                <td className="p-2.5 text-zinc-500">{u.workEmail}</td>
                                <td className="p-2.5">
                                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-2.5 text-zinc-400">{u.lskNo || 'Advocate'}</td>
                                <td className="p-2.5 text-right">
                                  <button 
                                    onClick={() => handleDeleteRealUser(u.id, u.fullName)}
                                    className="text-rose-600 hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // MOCK DATABASE STUDIOS FOR OTHER PROJECTS
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center">
                        <span className="font-mono text-zinc-600 dark:text-zinc-400">
                          Mock Database Studio &middot; {selectedDrawerProject.name}
                        </span>
                        <button 
                          onClick={() => showToast('Mock row added.')}
                          className="px-2.5 py-1 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10.5px] font-bold cursor-pointer"
                        >
                          + Add Row
                        </button>
                      </div>

                      {selectedDrawerProject.mockType === 'myschools' && (
                        <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400">
                            <tr>
                              <th className="p-2">Nemis No</th>
                              <th className="p-2">Student</th>
                              <th className="p-2">Grade</th>
                              <th className="p-2">Fees</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {mockMySchools.map(s => (
                              <tr key={s.id}>
                                <td className="p-2 text-zinc-400">{s.nemisNo}</td>
                                <td className="p-2 font-medium text-zinc-900 dark:text-white font-sans">{s.name}</td>
                                <td className="p-2 text-zinc-500">{s.grade}</td>
                                <td className="p-2">{s.termFee}</td>
                                <td className="p-2 text-emerald-600">{s.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {selectedDrawerProject.mockType === 'innercircle' && (
                        <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400">
                            <tr>
                              <th className="p-2">Investor</th>
                              <th className="p-2">Tier</th>
                              <th className="p-2">Deposit</th>
                              <th className="p-2">Yield</th>
                              <th className="p-2">KYC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {mockInnerCircle.map(i => (
                              <tr key={i.id}>
                                <td className="p-2 font-medium text-zinc-900 dark:text-white font-sans">{i.name}</td>
                                <td className="p-2 text-amber-600">{i.tier}</td>
                                <td className="p-2">{i.deposit}</td>
                                <td className="p-2 text-emerald-600 font-bold">{i.monthlyYield}</td>
                                <td className="p-2 text-zinc-400">{i.kycStatus}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {selectedDrawerProject.mockType === 'freshcity' && (
                        <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400">
                            <tr>
                              <th className="p-2">Cashier</th>
                              <th className="p-2">Register</th>
                              <th className="p-2">Shift</th>
                              <th className="p-2">Cash Drawer</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {mockFreshCity.map(f => (
                              <tr key={f.id}>
                                <td className="p-2 font-medium text-zinc-900 dark:text-white font-sans">{f.cashier}</td>
                                <td className="p-2 text-zinc-500">{f.register}</td>
                                <td className="p-2 text-zinc-400">{f.shift}</td>
                                <td className="p-2 font-bold">{f.cashDrawer}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {selectedDrawerProject.mockType === 'sayara' && (
                        <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400">
                            <tr>
                              <th className="p-2">Product</th>
                              <th className="p-2">SKU</th>
                              <th className="p-2">Cost</th>
                              <th className="p-2">KES Price</th>
                              <th className="p-2">Margin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {mockSayara.map(p => (
                              <tr key={p.id}>
                                <td className="p-2 font-medium text-zinc-900 dark:text-white font-sans">{p.title}</td>
                                <td className="p-2 text-zinc-400">{p.sheinSku}</td>
                                <td className="p-2 text-zinc-500">{p.costUsd}</td>
                                <td className="p-2 font-bold">{p.priceKes}</td>
                                <td className="p-2 text-emerald-600">{p.margin}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'tasks' && (
                <div className="space-y-3 text-xs">
                  {selectedDrawerProject.tasks.map((task, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-zinc-800 dark:text-zinc-200">{task}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD REAL USER TO KARANI LAW MODAL */}
      {/* ========================================================================= */}
      {showAddRealUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Add Real User to Database (Karani Law)
              </h3>
              <button onClick={() => setShowAddRealUserModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRealUser} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Adv. Jane Wambui"
                  value={newUserFullName}
                  onChange={e => setNewUserFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Work Email (Login)</label>
                <input 
                  type="email" 
                  placeholder="jwambui@kithinjilegal.co.ke"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Role</label>
                  <select 
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Managing Partner">Managing Partner</option>
                    <option value="Senior Associate">Senior Associate</option>
                    <option value="Associate">Associate</option>
                    <option value="Pupil">Pupil</option>
                    <option value="Billing Clerk">Billing Clerk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">LSK Roll Number</label>
                  <input 
                    type="text" 
                    placeholder="P105/18249/22"
                    value={newUserLskNo}
                    onChange={e => setNewUserLskNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Initial Password</label>
                <input 
                  type="text" 
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddRealUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold cursor-pointer shadow-xs"
                >
                  Save to Database &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WHATSAPP BILL DISPATCH MODAL */}
      {/* ========================================================================= */}
      {whatsAppModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                WhatsApp Bill for {whatsAppModalClient.name}
              </h3>
              <button onClick={() => setWhatsAppModalClient(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Copy this message and send it on WhatsApp:
            </p>

            <textarea 
              readOnly 
              value={whatsAppModalClient.message}
              rows={5}
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-mono text-zinc-800 dark:text-zinc-200"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setWhatsAppModalClient(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={copyWhatsAppText}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer shadow-xs"
              >
                Copy to Clipboard &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RAYCAST-STYLE COMMAND PALETTE (CTRL+K) */}
      {/* ========================================================================= */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              <input 
                type="text"
                autoFocus
                placeholder="Type a command or search (Karani, mySchools, users, restart)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-1 max-h-80 overflow-y-auto text-xs font-sans">
              <div 
                onClick={() => {
                  setShowCommandPalette(false);
                  setShowAddRealUserModal(true);
                }}
                className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-zinc-900 dark:text-white">Add New User to Karani Law Database</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Database Action</span>
              </div>

              {projects.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    setShowCommandPalette(false);
                    setSelectedDrawerProject(p);
                  }}
                  className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-800 dark:text-zinc-200">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{p.isRealDb ? 'Real DB' : 'Mock Studio'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW PROJECT MODAL */}
      {/* ========================================================================= */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Add New Startup Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">Register a new client or repository to your P3L fleet.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowAddProjectModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  showToast('Project registered to fleet.');
                  setShowAddProjectModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD TASK MODAL */}
      {/* ========================================================================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Add Founder Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">Add an action item to today's priority list.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  showToast('Task added to priority queue.');
                  setShowAddTaskModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
