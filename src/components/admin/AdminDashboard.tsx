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
  FileCode, PlayCircle, FolderArchive, Wifi, RefreshCcw
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
  category: 'Retail & POS' | 'E-commerce' | 'Automation & API' | 'LegalTech SaaS' | 'AI & Automation' | 'Research Archive';
  status: 'Live (In Store)' | 'Live (Vercel)' | 'Live (Python Daemon)' | 'In Development (78%)' | 'Debugging (API Issue)' | 'Paused / Archived';
  contractType: 'SoftwareRetainer' | 'Internal R&D' | 'Milestone Retainer';
  monthlyFee: string;
  initialPaid: string;
  nextMilestone: string;
  progress: number;
  health: string;
  techStack: string[];
  tasks: string[];
}

interface ClientAccount {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  category: string;
  activeProjects: string[];
  monthlyRetainer: string;
  initialPaid: string;
  currentMonthPaid: string;
  status: 'Active Retainer' | 'Live Production' | 'In Progress';
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

  // Time & Live Uptime Ticker
  const [uptimeSeconds, setUptimeSeconds] = useState(1582935); // 18d 7h 42m 15s
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (secs: number) => {
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Telemetry & Cluster State
  const [apiLatency, setApiLatency] = useState<number>(7);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => localStorage.getItem('BILLSZIP_MAINTENANCE_MODE') === 'true');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Context Menus
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<RealProject | null>(null);
  const [showDeploymentMenu, setShowDeploymentMenu] = useState(false);
  const [deploymentMenuPos, setDeploymentMenuPos] = useState({ x: 0, y: 0 });
  const [hoveredMilestoneTasks, setHoveredMilestoneTasks] = useState<{ project: string; tasks: string[] } | null>(null);

  // Revenue Switcher State
  const [revenuePeriod, setRevenuePeriod] = useState<'this_month' | 'last_6_months' | 'this_year'>('this_month');

  // Big Workspace Sub-Tab Switcher
  const [workspaceTab, setWorkspaceTab] = useState<'projects' | 'education' | 'server' | 'users'>('projects');

  // Tasks Filter (Work vs Personal)
  const [tasksFilter, setTasksFilter] = useState<'work' | 'personal'>('work');

  // Real Startup Projects (Fresh City POS, Sayara, Karani Law, OdinBot, Archives)
  const [projects, setProjects] = useState<RealProject[]>([
    {
      id: 'prj-fresh-city',
      name: 'Fresh City Supermarket POS',
      repo: 'guyo-halake/fresh-city-pos',
      githubUrl: 'https://github.com/guyo-halake',
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
      health: 'Active (Offline Ready)',
      techStack: ['Electron', 'React', 'SQLite', 'Thermal Printer Bridge'],
      tasks: [
        'Reconcile end-of-month barcode inventory batch',
        'Verify thermal printer automatic paper cut daemon',
        'Inspect offline SQLite ledger synchronization'
      ]
    },
    {
      id: 'prj-sayara-ecom',
      name: 'Sayara Aesthetics E-commerce',
      repo: 'guyo-halake/sayara-aesthetics',
      githubUrl: 'https://github.com/guyo-halake',
      liveUrl: 'https://sayara-aesthetics.vercel.app',
      client: 'Sarah Guyatu Rashid',
      clientPhone: '+254 114 807 215',
      clientEmail: 'sarahguyatu2@gmail.com',
      lead: 'Guyoh Halake',
      category: 'E-commerce',
      status: 'Live (Vercel)',
      contractType: 'SoftwareRetainer',
      monthlyFee: '% Commission + Maintenance',
      initialPaid: 'KES 10,000',
      nextMilestone: 'Seasonal beauty catalog refresh & payment gateway check',
      progress: 100,
      health: '200 OK (24ms)',
      techStack: ['Next.js', 'React', 'Tailwind', 'Vercel Edge'],
      tasks: [
        'Test Shein product price margin formula',
        'Review Vercel Edge cache hit ratio and load times',
        'Verify M-Pesa automated checkout callback'
      ]
    },
    {
      id: 'prj-sayara-api',
      name: 'Sayara Aesthetics Shein Python API',
      repo: 'guyo-halake/sayara-shein-sync',
      githubUrl: 'https://github.com/guyo-halake',
      liveUrl: 'https://api.sayara.p3ldev.com',
      client: 'Sarah Guyatu Rashid',
      clientPhone: '+254 114 807 215',
      clientEmail: 'sarahguyatu2@gmail.com',
      lead: 'Guyoh Halake',
      category: 'Automation & API',
      status: 'Live (Python Daemon)',
      contractType: 'SoftwareRetainer',
      monthlyFee: 'Included in Sayara Retainer',
      initialPaid: 'KES 0 (Bundled)',
      nextMilestone: 'Automated hourly catalog sync cron & webhook verification',
      progress: 92,
      health: 'Active Daemon (Port 8040)',
      techStack: ['Python 3.11', 'FastAPI', 'Playwright / Requests', 'Redis'],
      tasks: [
        'Verify automated Shein price markup rules and webhook triggers',
        'Monitor hourly catalog sync retry queue',
        'Validate USD to KES live currency converter multiplier'
      ]
    },
    {
      id: 'prj-karani-law',
      name: 'Karani Law & BillsZip ERP',
      repo: 'guyo-halake/karani_law',
      githubUrl: 'https://github.com/guyo-halake/karani_law',
      liveUrl: 'https://nyagah-b-fee-notes.azurewebsites.net',
      client: 'Adv. Nyagah B. Kithinji',
      clientPhone: '+254 (0)20 271 8900',
      clientEmail: 'advocate@kithinjilegal.co.ke',
      lead: 'Guyoh Halake',
      category: 'LegalTech SaaS',
      status: 'In Development (78%)',
      contractType: 'Milestone Retainer',
      monthlyFee: 'Milestone Retainer',
      initialPaid: 'Milestone Billing',
      nextMilestone: 'Azure ACR multi-container rollout & statutory math sign-off',
      progress: 78,
      health: '200 OK (Azure App Service)',
      techStack: ['TypeScript', 'React', 'FastAPI', 'Docker', 'Azure ACR', 'Supabase'],
      tasks: [
        'Finalize Schedule 6 statutory calculation engine & test bench',
        'Verify Azure App Service multi-container Docker compose',
        'Conduct advocate UAT walkthrough for fee notes and Bills of Costs'
      ]
    },
    {
      id: 'prj-odinbot',
      name: 'OdinBot AI Assistant',
      repo: 'guyo-halake/odinbot-ai',
      githubUrl: 'https://github.com/guyo-halake',
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
      tasks: [
        'Fix I&M Bank mirror connection error in razak-server/mirrors/api/kenyanbanks/IandM',
        'Re-bind mirror socket to port 8082 with retry circuit breaker',
        'Test autonomous agent tool calling loop with live bank balances'
      ]
    },
    {
      id: 'prj-cv-detector',
      name: 'Computer Vision & Human Detector',
      repo: 'guyo-halake/cv-object-human-detetors',
      githubUrl: 'https://github.com/guyo-halake/cv-object-human-detetors',
      liveUrl: 'Archived on GitHub',
      client: 'P3L Research Archive',
      clientPhone: '—',
      clientEmail: '—',
      lead: 'Guyoh Halake',
      category: 'Research Archive',
      status: 'Paused / Archived',
      contractType: 'Internal R&D',
      monthlyFee: 'KES 0',
      initialPaid: 'KES 0',
      nextMilestone: 'Archived repository',
      progress: 100,
      health: 'Archived',
      techStack: ['Python', 'YOLOv8', 'OpenCV'],
      tasks: ['Repository preserved for reference']
    },
    {
      id: 'prj-iot-lab',
      name: 'IoT Hardware Telemetry & ESP32 Lab',
      repo: 'guyo-halake/IoT-playground',
      githubUrl: 'https://github.com/guyo-halake/IoT-playground',
      liveUrl: 'Archived on GitHub',
      client: 'P3L Research Archive',
      clientPhone: '—',
      clientEmail: '—',
      lead: 'Guyoh Halake',
      category: 'Research Archive',
      status: 'Paused / Archived',
      contractType: 'Internal R&D',
      monthlyFee: 'KES 0',
      initialPaid: 'KES 0',
      nextMilestone: 'Hardware lab on hold',
      progress: 100,
      health: 'Archived',
      techStack: ['C++', 'ESP32', 'MQTT'],
      tasks: ['Firmware code preserved for future IoT installations']
    }
  ]);

  // Real Client Directory
  const [clients] = useState<ClientAccount[]>([
    {
      id: 'cli-01',
      name: 'Rosemary Wakonyo',
      company: 'Fresh City Supermarket',
      phone: '+254 756111885',
      email: 'Direct Phone / In-Store',
      category: 'Retail Supermarket',
      activeProjects: ['Fresh City Supermarket POS'],
      monthlyRetainer: 'KES 3,500',
      initialPaid: 'KES 32,000 (Fully Settled)',
      currentMonthPaid: 'KES 3,500',
      status: 'Live Production'
    },
    {
      id: 'cli-02',
      name: 'Sarah Guyatu Rashid',
      company: 'Sayara Aesthetics',
      phone: '+254 114 807 215',
      email: 'sarahguyatu2@gmail.com',
      category: 'E-commerce & Beauty',
      activeProjects: ['Sayara Aesthetics E-commerce', 'Sayara Aesthetics Shein Python API'],
      monthlyRetainer: '% Commission + Support',
      initialPaid: 'KES 10,000 (Storefront Build)',
      currentMonthPaid: 'KES 3,200 (Maintenance & Commission)',
      status: 'Active Retainer'
    },
    {
      id: 'cli-03',
      name: 'Adv. Nyagah B. Kithinji',
      company: 'Nyagah B. Kithinji & Co. Advocates',
      phone: '+254 (0)20 271 8900',
      email: 'advocate@kithinjilegal.co.ke',
      category: 'Legal Practice',
      activeProjects: ['Karani Law & BillsZip ERP'],
      monthlyRetainer: 'Milestone Retainer',
      initialPaid: 'Milestone Structure',
      currentMonthPaid: 'KES 0 (Stage 4 pending UAT)',
      status: 'In Progress'
    }
  ]);

  // Founder Daily Priorities (Work vs Personal)
  const [tasks, setTasks] = useState<FounderTask[]>([
    {
      id: 'tsk-01',
      title: 'Karani Law ERP: Bills of Costs statutory calculations & Azure multi-container build',
      category: 'work',
      project: 'Karani Law & BillsZip ERP',
      priority: 'high',
      completed: false,
      dueDate: 'Today, 17:00',
      notes: 'Currently at 78% completion. Test Schedule 6 and getting-up fees.'
    },
    {
      id: 'tsk-02',
      title: 'Sayara Aesthetics: Verify automated Shein price markup rules and webhook triggers',
      category: 'work',
      project: 'Sayara Aesthetics Shein Python API',
      priority: 'normal',
      completed: false,
      dueDate: 'Today, 19:30',
      notes: 'Check Python worker queue and Sarah product margin formula.'
    },
    {
      id: 'tsk-03',
      title: 'CRITICAL ALERT: OdinBot cannot access I&M Bank API in razak-server/mirrors/api/kenyanbanks/IandM',
      category: 'work',
      project: 'OdinBot AI Assistant',
      priority: 'critical',
      completed: false,
      dueDate: 'Urgent',
      notes: 'Connection refused / Port 8082 unreachable. Restart local mirror daemon.'
    },
    {
      id: 'tsk-04',
      title: 'Fresh City POS: Test thermal receipt auto-cut & daily cash-drawer batch ledger',
      category: 'work',
      project: 'Fresh City Supermarket POS',
      priority: 'normal',
      completed: true,
      dueDate: 'Yesterday',
      notes: 'Rosemary terminal operational and printing cleanly.'
    },
    {
      id: 'tsk-05',
      title: 'Distributed Systems Coursework: Complete Consensus Algorithms Assignment 3',
      category: 'personal',
      priority: 'high',
      completed: false,
      dueDate: 'Friday, 23:59',
      notes: 'Raft consensus implementation and fault-tolerance write-up.'
    },
    {
      id: 'tsk-06',
      title: 'Software Architecture University Project: Prepare slides for microservices review',
      category: 'personal',
      priority: 'normal',
      completed: false,
      dueDate: 'Thursday, 14:00',
      notes: 'Cover FastAPI + Docker multi-container design.'
    },
    {
      id: 'tsk-07',
      title: 'Review Python asyncio & event loop concurrency lecture notes',
      category: 'personal',
      priority: 'normal',
      completed: true,
      dueDate: 'Completed',
      notes: 'Reviewed thread pools and coroutines.'
    },
    {
      id: 'tsk-08',
      title: 'Biftu Construction Marsabit workstation backup & Starlink router check',
      category: 'personal',
      priority: 'normal',
      completed: false,
      dueDate: 'This Weekend',
      notes: 'Verify Marsabit secondary LTE failover gateway.'
    }
  ]);

  // Education & Coursework Data
  const [coursework] = useState([
    { id: 'cw-1', subject: 'Distributed Systems', title: 'Assignment 3: Consensus & Partitioning', deadline: 'In 3 days', status: 'In Progress', marks: 'Pending' },
    { id: 'cw-2', subject: 'Database Systems', title: 'Lab 4: B-Tree Indexing & Query Optimizations', deadline: 'Completed', status: 'Submitted', marks: '92 / 100' },
    { id: 'cw-3', subject: 'Software Engineering', title: 'Milestone 2: Architecture & Specification', deadline: 'Submitted', status: 'Graded', marks: '88 / 100' },
    { id: 'cw-4', subject: 'Compiler Design', title: 'Lexical Analyzer & AST Parser in Python', deadline: 'Nov 8', status: 'Not Started', marks: 'Pending' }
  ]);

  const [readingPdfs] = useState([
    { title: 'Distributed Systems: Concepts and Design (Coulouris).pdf', pages: '942 pp', category: 'Distributed Computing' },
    { title: 'FastAPI High-Performance Production Microservices.pdf', pages: '310 pp', category: 'Backend Architecture' },
    { title: 'PostgreSQL Internals & Query Planning Handbook.pdf', pages: '450 pp', category: 'Database Systems' },
    { title: 'Kenya Law Advocates Remuneration Order L.N. 35 2014.pdf', pages: '128 pp', category: 'Statutory Law' }
  ]);

  // Razak-Server Daemon Processes
  const [serverDaemons] = useState([
    { pid: 1024, name: 'fastapi-backend', port: 8000, cpu: '1.2%', memory: '180 MB', uptime: '18d 07h', status: 'Running' },
    { pid: 1088, name: 'vite-frontend', port: 3000, cpu: '0.4%', memory: '95 MB', uptime: '18d 07h', status: 'Running' },
    { pid: 2042, name: 'sayara-shein-daemon', port: 8040, cpu: '2.1%', memory: '210 MB', uptime: '14d 12h', status: 'Running' },
    { pid: 3012, name: 'odinbot-core-agent', port: 8080, cpu: '5.8%', memory: '450 MB', uptime: '3d 04h', status: 'Degraded' },
    { pid: 4099, name: 'postgresql-pool', port: 5432, cpu: '1.0%', memory: '320 MB', uptime: '18d 07h', status: 'Running' },
    { pid: 5001, name: 'nginx-ingress-proxy', port: '80 / 443', cpu: '0.2%', memory: '45 MB', uptime: '18d 07h', status: 'Running' }
  ]);

  const [mirrorApis] = useState([
    { endpoint: 'razak-server/mirrors/api/kenyanbanks/IandM', protocol: 'REST / JSON', port: 8082, status: 'Offline (502 / Fix Needed)', latency: '—', alert: true },
    { endpoint: 'razak-server/mirrors/api/mpesa_b2c', protocol: 'HTTPS / TLS', port: 8084, status: 'Active (200 OK)', latency: '18 ms', alert: false },
    { endpoint: 'razak-server/mirrors/api/sms_gateway', protocol: 'HTTP / Webhook', port: 8086, status: 'Active (200 OK)', latency: '12 ms', alert: false }
  ]);

  // Recent Activity Log (From last week to yesterday)
  const [recentActivities] = useState([
    { id: 'act-1', actor: 'Guyo Halake', action: 'Pushed 4 commits to guyo-halake/karani_law (branch: update-4)', time: 'Yesterday, 18:40', tag: 'Git Commit' },
    { id: 'act-2', actor: 'Sayara Shein API', action: 'Automated catalog sync completed (142 fashion items updated)', time: 'Yesterday, 14:15', tag: 'Python Cron' },
    { id: 'act-3', actor: 'Rosemary Wakonyo', action: 'Fresh City POS closed daily cash-drawer and reconciled local register batch', time: 'Yesterday, 21:30', tag: 'Retail POS' },
    { id: 'act-4', actor: 'Sarah Guyatu Rashid', action: 'Payment received: KES 3,200 for Sayara Aesthetics monthly maintenance & commission', time: '12 Oct, 11:20', tag: 'Payment' },
    { id: 'act-5', actor: 'Azure CI/CD', action: 'Docker image built and pushed to acrnyagahfee.azurecr.io', time: '11 Oct, 16:05', tag: 'Azure ACR' },
    { id: 'act-6', actor: 'razak-server', action: 'Alert: I&M Bank mirror connection timeout at razak-server/mirrors/api/kenyanbanks/IandM', time: '10 Oct, 09:12', tag: 'API Warning' }
  ]);

  // Modals for Adding Projects / Tasks / Payments
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);

  // New Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState<RealProject['category']>('Retail & POS');
  const [newProjectFee, setNewProjectFee] = useState('KES 3,500 / mo');

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'personal'>('work');
  const [newTaskPriority, setNewTaskPriority] = useState<FounderTask['priority']>('normal');

  // Log Payment Form
  const [paymentClient, setPaymentClient] = useState('Sarah Guyatu Rashid (Sayara Aesthetics)');
  const [paymentAmount, setPaymentAmount] = useState('3200');
  const [paymentNote, setPaymentNote] = useState('Sayara Aesthetics maintenance & commission');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    showToast('Task updated.');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newPrj: RealProject = {
      id: 'prj-' + Date.now(),
      name: newProjectName.trim(),
      repo: `guyo-halake/${newProjectName.toLowerCase().replace(/\s+/g, '-')}`,
      githubUrl: 'https://github.com/guyo-halake',
      liveUrl: 'Staging / In Development',
      client: newProjectClient.trim() || 'Direct Client',
      clientPhone: '+254 700 000 000',
      clientEmail: 'client@p3ldev.com',
      lead: 'Guyoh Halake',
      category: newProjectCategory,
      status: 'In Development (78%)',
      contractType: 'SoftwareRetainer',
      monthlyFee: newProjectFee.trim() || 'KES 3,500 / mo',
      initialPaid: 'KES 0',
      nextMilestone: 'Initial prototype and requirements baseline',
      progress: 25,
      health: 'Active Development',
      techStack: ['TypeScript', 'FastAPI'],
      tasks: ['Define project scope', 'Initialize Git repository', 'Configure local environment']
    };
    setProjects([newPrj, ...projects]);
    setShowAddProjectModal(false);
    setNewProjectName('');
    setNewProjectClient('');
    showToast(`Project "${newPrj.name}" registered to fleet.`);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: FounderTask = {
      id: 'tsk-' + Date.now(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      dueDate: 'Today'
    };
    setTasks([newTask, ...tasks]);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    showToast('Task added to priority queue.');
  };

  const handleLogPayment = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Payment of KES ${Number(paymentAmount).toLocaleString()} logged from ${paymentClient}.`);
    setShowLogPaymentModal(false);
  };

  const handleDeploymentContextMenu = (e: React.MouseEvent, project: RealProject) => {
    e.preventDefault();
    setSelectedDeployment(project);
    setDeploymentMenuPos({ x: e.clientX, y: e.clientY });
    setShowDeploymentMenu(true);
  };

  const toggleMaintenance = () => {
    const next = !isMaintenanceMode;
    setIsMaintenanceMode(next);
    localStorage.setItem('BILLSZIP_MAINTENANCE_MODE', String(next));
    window.dispatchEvent(new CustomEvent('maintenanceModeChanged', { detail: next }));
    showToast(next ? 'Emergency Read-Only Mode Activated.' : 'Platform restored to active state.');
  };

  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      organization: 'P3L Developers (subsidiary Biftu Construction Company, Marsabit)',
      founder: 'Guyoh Halake',
      server: 'razak-server',
      station: 'Marsabit County, Kenya',
      revenue: { thisMonth: 8000, last6Months: 43000, sarahPayment: 3200 },
      projects,
      clients,
      tasks,
      coursework,
      serverDaemons,
      mirrorApis
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `p3l_developers_master_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Full P3L Master Snapshot Exported.');
  };

  // The 11 Authoritative Sidebar Hubs
  const navItems: Array<{ id: AdminTab; label: string; icon: any; count?: number; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects_clients', label: 'Projects & Clients', icon: Briefcase, count: projects.length },
    { id: 'users_rbac', label: 'Users & RBAC', icon: Users, count: 5 },
    { id: 'finance_billing', label: 'Finance & Billing', icon: DollarSign, badge: 'KES 8,000' },
    { id: 'ai_infra', label: 'AI & Infrastructure', icon: Bot, badge: 'OdinBot' },
    { id: 'career_education', label: 'Career & Education', icon: GraduationCap, count: 4 },
    { id: 'internal_staff', label: 'Internal P3L Staff', icon: UserCheck, count: 3 },
    { id: 'comms_messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'server', label: 'Razak Server', icon: Cpu, badge: '7 ms' },
    { id: 'support_ticketing', label: 'Support & Ticketing', icon: HelpCircle },
    { id: 'system_wipe', label: 'System Wipes', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#f8fafc] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR: ALL 11 AUTHORITATIVE WORKSPACES */}
      {/* ========================================================================= */}
      <aside className="w-64 flex flex-col py-4 px-3 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs z-20 shrink-0">
        
        {/* Brand Header with Logo */}
        <div className="px-2 pb-3.5 mb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0">
              <img 
                src="/p3l_logo_nobg.png" 
                alt="P3L" 
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  // Fallback to text initials if image path fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-brand font-black text-xs text-slate-900 dark:text-white" style={{ display: 'none' }}>P3L</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-brand truncate">
                P3L Developers
              </p>
              <p className="text-[9.5px] text-slate-400 dark:text-zinc-400 font-mono truncate leading-tight mt-0.5">
                subsidiary Biftu Construction Company, Marsabit
              </p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="System Online"></span>
        </div>

        {/* Navigation Tabs (All 11 Exact Hubs) */}
        <div className="flex flex-col gap-1 flex-1 w-full overflow-y-auto pr-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-3 py-1 font-mono">
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
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{nav.label}</span>
                </div>
                {nav.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                    isActive ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                  }`}>
                    {nav.count}
                  </span>
                )}
                {nav.badge && (
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    isActive ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                  }`}>
                    {nav.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Marsabit Node Status */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 flex items-center justify-between text-[10.5px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              razak-server
            </span>
            <span className="text-slate-900 dark:text-white font-bold">{apiLatency} ms</span>
          </div>

          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Karani Law Portal</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Command Bar */}
                {/* Top Command Bar */}
        <header className="px-8 py-3.5 w-full flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700">
                <img src="/p3l_logo_nobg.png" alt="P3L" className="w-full h-full object-contain p-0.5" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white font-brand block leading-tight">
                  P3L Developers
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block leading-tight">
                  subsidiary Biftu Construction Company, Marsabit
                </span>
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="relative hidden md:block w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
              <input 
                type="text"
                placeholder="Search repos, clients, tasks (Ctrl+K)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold">
                Branch: <strong className="text-slate-900 dark:text-white">update-4</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                razak-server: 7ms
              </span>
            </div>

            <button
              onClick={() => showToast('No unread server alerts.')}
              className="p-2 rounded-full text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-slate-100 dark:to-zinc-200 text-white dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950/20 transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Launch Karani Portal</span>
            </button>
          </div>
        </header>

        {/* Scrollable Work Canvas */}
        <main className="flex-1 overflow-y-auto px-8 py-6 pb-20">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ========================================================================= */}
            {/* HERO WELCOME HEADER & PILL ACTION BAR (UNBOXED, AIRY, PURE SLEEK MODERN) */}
            {/* ========================================================================= */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-1 pb-1">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-brand">
                    Hey Guyo, welcome to <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">P3L Developers Command</span>
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Fleet
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2 flex-wrap font-sans">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Marsabit County Operations Node</span>
                  <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                  <span>Sayara Aesthetics, Fresh City POS, Karani Law &amp; OdinBot</span>
                </p>
              </div>

              {/* Action Buttons: High-Contrast PILLS */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Project</span>
                </button>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Task</span>
                </button>

                <button
                  onClick={() => setShowLogPaymentModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Payment</span>
                </button>

                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-700/80 shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                  title="Export full JSON master backup"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Master Snapshot</span>
                </button>

                <button
                  onClick={toggleMaintenance}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isMaintenanceMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-md shadow-red-600/30' 
                      : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-300/80 dark:border-rose-800/80'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isMaintenanceMode ? 'Kill-Switch Active' : 'Kill-Switch'}</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. DASHBOARD VIEW: TOP 3 CORE FOUNDER CARDS */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 3 Vital Cards with Bold Distinct Theming */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* CARD 1: REVENUE & CASHFLOW WITH PILL PERIOD SWITCHER (EMERALD THEME) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/[0.08] via-teal-500/[0.03] to-white dark:to-zinc-900 border border-emerald-500/30 dark:border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Cashflow &amp; Revenue
                        </span>
                        {/* Pill Period Switcher */}
                        <div className="flex items-center p-1 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[10.5px] font-mono">
                          <button
                            onClick={() => setRevenuePeriod('this_month')}
                            className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                              revenuePeriod === 'this_month' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-slate-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-white'
                            }`}
                          >
                            This Month
                          </button>
                          <button
                            onClick={() => setRevenuePeriod('last_6_months')}
                            className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                              revenuePeriod === 'last_6_months' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-slate-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-white'
                            }`}
                          >
                            Last 6 Mo
                          </button>
                          <button
                            onClick={() => setRevenuePeriod('this_year')}
                            className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                              revenuePeriod === 'this_year' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-slate-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-white'
                            }`}
                          >
                            This Year
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Big Figure in Vivid Bold Emerald */}
                      <div className="space-y-2">
                        <p className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                          {revenuePeriod === 'this_month' ? 'KES 8,000' : revenuePeriod === 'last_6_months' ? 'KES 43,000' : 'KES 85,000'}
                        </p>
                        
                        {/* Context explanation pill banner */}
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {revenuePeriod === 'this_month' 
                              ? 'KES 3,200 received from Sarah Rashid (Sayara) + KES 4,800 other sources' 
                              : revenuePeriod === 'last_6_months'
                              ? '6-Month client settlements & POS license disbursements'
                              : 'Annual startup revenue across client accounts'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown list with colorful pill badges */}
                    <div className="pt-3 border-t border-emerald-500/20 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                        <span className="font-sans font-medium text-slate-800 dark:text-zinc-200">Fresh City POS Retainer:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">KES 3,500/mo</span>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Setup 32k paid
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                        <span className="font-sans font-medium text-slate-800 dark:text-zinc-200">Sayara Aesthetics:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">% Comm.</span>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                            Setup 10k paid
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                        <span className="font-sans font-medium text-slate-800 dark:text-zinc-200">Karani Law ERP:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">Milestone</span>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            In Progress
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: LIVE SERVICES & VERCEL CLOUD DEPLOYMENTS (CYAN / SKY THEME) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] via-sky-500/[0.03] to-white dark:to-zinc-900 border border-cyan-500/30 dark:border-cyan-500/40 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          Live Deployments (Top 3)
                        </span>
                        <span className="text-[10.5px] font-mono px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                          3 Running
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {/* 1. Sayara Aesthetics Storefront */}
                        <div 
                          onContextMenu={(e) => handleDeploymentContextMenu(e, projects.find(p => p.id === 'prj-sayara-ecom')!)}
                          className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/60 hover:border-cyan-400/80 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                Sayara Aesthetics Storefront
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              sayara-aesthetics.vercel.app &middot; 24ms
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-[10px] font-mono shrink-0">
                            200 OK
                          </span>
                        </div>

                        {/* 2. Sayara Shein Python Sync API */}
                        <div 
                          onContextMenu={(e) => handleDeploymentContextMenu(e, projects.find(p => p.id === 'prj-sayara-api')!)}
                          className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/60 hover:border-purple-400/80 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              Sayara Shein Python Sync API
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              api.sayara.p3ldev.com &middot; Port 8040
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-[10px] font-mono shrink-0">
                            Daemon
                          </span>
                        </div>

                        {/* 3. Fresh City Supermarket POS */}
                        <div 
                          onContextMenu={(e) => handleDeploymentContextMenu(e, projects.find(p => p.id === 'prj-fresh-city')!)}
                          className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/60 hover:border-blue-400/80 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              Fresh City Supermarket POS
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              Rosemary Terminal POS-01 (In Store)
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-bold text-[10px] font-mono shrink-0">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400/80 pt-2 border-t border-cyan-500/20">
                      Right-click any deployment card to inspect logs or restart
                    </p>
                  </div>

                  {/* CARD 3: TODAY'S PRIORITIES & HIGH-SEVERITY ALERTS (INDIGO & ROSE THEME) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.03] to-white dark:to-zinc-900 border border-indigo-500/30 dark:border-indigo-500/40 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          Today's Priorities
                        </span>
                        {/* Pill Work vs Personal Filter */}
                        <div className="flex items-center p-1 bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/20 rounded-full text-[10.5px] font-mono">
                          <button
                            onClick={() => setTasksFilter('work')}
                            className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                              tasksFilter === 'work' 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-slate-600 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-white'
                            }`}
                          >
                            Work
                          </button>
                          <button
                            onClick={() => setTasksFilter('personal')}
                            className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                              tasksFilter === 'personal' 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-slate-600 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-white'
                            }`}
                          >
                            Personal
                          </button>
                        </div>
                      </div>

                      {/* Work Tasks View */}
                      {tasksFilter === 'work' ? (
                        <div className="space-y-2.5">
                          {/* Karani Law Vivid Multi-stop Gradient Progress Bar */}
                          <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">Karani Law &amp; BillsZip ERP</span>
                              <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">78%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 h-full rounded-full transition-all" style={{ width: '78%' }}></div>
                            </div>
                            <span className="text-[10px] text-indigo-900/80 dark:text-indigo-300/80 block font-mono">
                              Milestone: Bills of Costs &amp; Azure deployment sign-off
                            </span>
                          </div>

                          {/* Sayara Pending Task */}
                          <div 
                            onClick={() => toggleTask('tsk-02')}
                            className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 flex items-start gap-2.5 cursor-pointer hover:border-indigo-400 transition-colors"
                          >
                            <input 
                              type="checkbox" 
                              checked={tasks.find(t => t.id === 'tsk-02')?.completed} 
                              onChange={() => {}} 
                              className="rounded-full w-4 h-4 mt-0.5 cursor-pointer accent-indigo-600" 
                            />
                            <div className="text-xs">
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                Sayara: Verify Shein price markup rules &amp; webhooks
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">Due Today, 19:30</span>
                            </div>
                          </div>

                          {/* CRITICAL INCIDENT ERROR CARD (HIGH-CONTRAST ROSE RED) */}
                          <div className="p-3 rounded-xl border border-rose-400 dark:border-rose-800 bg-rose-500/15 text-xs space-y-1">
                            <span className="font-bold text-rose-700 dark:text-rose-400 block flex items-center gap-1.5 font-mono">
                              <AlertOctagon className="w-4 h-4 text-rose-600" />
                              Critical API Gateway Incident
                            </span>
                            <p className="text-[11px] text-rose-950 dark:text-rose-200 font-mono">
                              OdinBot cannot access I&amp;M Bank mirror: <code className="bg-rose-200/60 dark:bg-rose-900/40 px-1 py-0.5 rounded">razak-server/mirrors/api/kenyanbanks/IandM</code> (502 Refused)
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Personal Tasks View */
                        <div className="space-y-2">
                          {tasks.filter(t => t.category === 'personal').map(t => (
                            <div 
                              key={t.id}
                              onClick={() => toggleTask(t.id)}
                              className={`p-2.5 rounded-xl border transition-colors flex items-start gap-2 cursor-pointer ${
                                t.completed ? 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60' : 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 hover:border-indigo-400'
                              }`}
                            >
                              <input 
                                type="checkbox" 
                                checked={t.completed} 
                                onChange={() => {}} 
                                className="rounded-full w-4 h-4 mt-0.5 cursor-pointer accent-indigo-600" 
                              />
                              <div className="text-xs">
                                <span className={`font-semibold block ${t.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                  {t.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{t.dueDate}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-indigo-500/20 flex justify-between items-center text-[10.5px] font-mono text-slate-400">
                      <span>Completed: {tasks.filter(t => t.completed).length}/{tasks.length}</span>
                      <button 
                        onClick={() => setShowAddTaskModal(true)} 
                        className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10.5px] shadow-sm cursor-pointer transition-all"
                      >
                        + Add Priority
                      </button>
                    </div>
                  </div>

                </div>

                {/* COMPANION STRIP: RAZAK-SERVER TELEMETRY & RECENT STARTUP ACTIVITIES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Left: razak-server Live Ticker (DARK COMMAND STATION) */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 shadow-md flex flex-col justify-between space-y-4 font-mono">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-sm tracking-tight text-white">razak-server</span>
                      </div>
                      <span className="text-[10.5px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {apiLatency} ms Speed
                      </span>
                    </div>

                    {/* Live Clock Dynamic Monospace Counter */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        Running Uptime (Live Clock):
                      </span>
                      <p className="text-2xl font-black text-cyan-400 tracking-wider">
                        {formatUptime(uptimeSeconds)}
                      </p>
                    </div>

                    {/* Hardware telemetry bars */}
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">CPU Load:</span>
                          <span className="text-cyan-300 font-bold">14% (8 Cores)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '14%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">RAM Allocation:</span>
                          <span className="text-purple-300 font-bold">1.8 GB / 8.0 GB</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: '22.5%' }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px] pt-1">
                        <span className="text-slate-400">Host:</span>
                        <span className="text-white font-semibold">Marsabit Biftu Station</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDiagnosticsModal(true)}
                      className="w-full py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Inspect Telemetry &rarr;</span>
                    </button>
                  </div>

                  {/* Right: Startup Recent Activity Feed */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white font-brand flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          Startup Recent Activity &amp; Releases
                        </h3>
                        <p className="text-[11px] text-slate-400">Past 7 days across P3L projects</p>
                      </div>
                      <span className="text-[10.5px] font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700">
                        {recentActivities.length} Audits
                      </span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1 font-mono text-xs">
                      {recentActivities.map(act => (
                        <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                          <div className="min-w-0">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold inline-block mb-1 ${
                              act.tag === 'Git Commit' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30' :
                              act.tag === 'Python Cron' ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30' :
                              act.tag === 'Retail POS' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30' :
                              'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {act.tag}
                            </span>
                            <p className="font-medium text-slate-800 dark:text-zinc-200 truncate font-sans text-xs">
                              {act.action}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 mt-1">{act.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>Live sync via razak-server daemon</span>
                      <button onClick={() => showToast('Refreshed recent activity logs')} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold">
                        Refresh Stream
                      </button>
                    </div>
                  </div>

                </div>

                {/* ========================================================================= */}
                {/* BIG WORKSPACE CARD: 4 SUB-TABS (PROJECTS, EDUCATION, RAZAK SERVER, USERS) */}
                {/* ========================================================================= */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                  
                  {/* Tab Navigation Pill Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 gap-3">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold overflow-x-auto">
                      <button
                        onClick={() => setWorkspaceTab('projects')}
                        className={`px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                          workspaceTab === 'projects' 
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' 
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Projects Status ({projects.length})</span>
                      </button>

                      <button
                        onClick={() => setWorkspaceTab('education')}
                        className={`px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                          workspaceTab === 'education' 
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' 
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Education &amp; Skills</span>
                      </button>

                      <button
                        onClick={() => setWorkspaceTab('server')}
                        className={`px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                          workspaceTab === 'server' 
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' 
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Server className="w-3.5 h-3.5" />
                        <span>Razak Server</span>
                      </button>

                      <button
                        onClick={() => setWorkspaceTab('users')}
                        className={`px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                          workspaceTab === 'users' 
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' 
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Users Management</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddProjectModal(true)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project</span>
                      </button>
                      <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* --------------------------------------------------------------------- */}
                  {/* SUB-TAB 1: PROJECTS STATUS (ALL 7 REPOS) */}
                  {/* --------------------------------------------------------------------- */}
                  {workspaceTab === 'projects' && (
                    <div className="overflow-x-auto animate-fadeIn">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10.5px] uppercase font-mono text-slate-500 dark:text-zinc-400 tracking-wider">
                            <th className="py-2.5 px-3">Client</th>
                            <th className="py-2.5 px-3">Service / Product</th>
                            <th className="py-2.5 px-3">Contract Type</th>
                            <th className="py-2.5 px-3">Monthly Rate / Fee</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Next Milestone (Hover for Tasks)</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                          {projects.map(p => {
                            const initials = p.client.split(' ').map(n => n[0]).join('').substring(0, 2);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group">
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300 font-sans shrink-0">
                                      {initials}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-900 dark:text-white block font-sans truncate">{p.client}</span>
                                      <span className="text-[10px] text-slate-400">{p.clientPhone}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-semibold text-slate-900 dark:text-white block">{p.name}</span>
                                  <span className="text-[10px] text-slate-400 font-sans">{p.category}</span>
                                </td>
                                <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-semibold">
                                    {p.contractType}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{p.monthlyFee}</span>
                                  <span className="text-[10px] text-slate-400">Initial: {p.initialPaid}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                    p.status === 'Live (In Store)' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                                    p.status === 'Live (Vercel)' ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30' :
                                    p.status === 'Live (Python Daemon)' ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30' :
                                    p.status === 'In Development (78%)' ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30' :
                                    p.status === 'Debugging (API Issue)' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30' :
                                    'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td 
                                  className="py-3 px-3 relative cursor-help"
                                  onMouseEnter={() => setHoveredMilestoneTasks({ project: p.name, tasks: p.tasks })}
                                  onMouseLeave={() => setHoveredMilestoneTasks(null)}
                                >
                                  <span className="text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-sans text-xs underline decoration-dotted decoration-slate-400 transition-colors">
                                    {p.nextMilestone}
                                  </span>

                                  {/* Hover Task Flyout Tooltip */}
                                  {hoveredMilestoneTasks?.project === p.name && (
                                    <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-3 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 space-y-2 pointer-events-none animate-fadeIn">
                                      <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                                        <span className="font-bold text-[10.5px] uppercase font-mono text-cyan-400">Milestone Checklist</span>
                                        <span className="text-[9px] text-slate-400 font-mono">{p.tasks.length} tasks</span>
                                      </div>
                                      <ul className="space-y-1 text-[11px] font-sans">
                                        {p.tasks.map((t, idx) => (
                                          <li key={idx} className="flex items-start gap-1.5">
                                            <span className="text-emerald-400 mt-0.5">&bull;</span>
                                            <span className="text-slate-200">{t}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button 
                                    onClick={() => showToast(`Opening workspace for ${p.name}`)}
                                    className="px-3 py-1 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-xs font-bold cursor-pointer shadow-xs transition-all"
                                  >
                                    Open
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* --------------------------------------------------------------------- */}
                  {/* SUB-TAB 2: EDUCATION, COURSEWORK & SKILLS */}
                  {/* --------------------------------------------------------------------- */}
                  {workspaceTab === 'education' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Coursework & University Assignments */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                            <span>University Assignments &amp; Coursework</span>
                            <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">4 Active</span>
                          </h4>
                          <div className="space-y-2">
                            {coursework.map(c => (
                              <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{c.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{c.subject} &middot; Due: {c.deadline}</span>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 block font-bold">
                                    {c.status}
                                  </span>
                                  <span className="text-[9.5px] text-slate-500 mt-0.5 block">{c.marks}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reading PDFs & Architecture Handbooks */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                            <span>Reading PDFs &amp; Architecture References</span>
                            <span className="text-[10px] text-blue-600 font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">Offline Available</span>
                          </h4>
                          <div className="space-y-2">
                            {readingPdfs.map((pdf, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                                <div className="min-w-0 pr-2">
                                  <span className="font-semibold text-slate-900 dark:text-white block truncate">{pdf.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{pdf.category} &middot; {pdf.pages}</span>
                                </div>
                                <button
                                  onClick={() => showToast(`Opening reference: ${pdf.title}`)}
                                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-[10px] font-bold font-mono cursor-pointer shrink-0"
                                >
                                  Read
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Schedule: Lectures, Exams & Mentorship */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">Next Live Engineering Session</span>
                            <span className="text-slate-500 font-mono text-[10.5px]">Distributed Systems Lecture &middot; Tomorrow, 10:00 AM (Zoom)</span>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast('Session reminder logged')}
                          className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                        >
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --------------------------------------------------------------------- */}
                  {/* SUB-TAB 3: RAZAK SERVER DAEMONS & MIRROR APIS */}
                  {/* --------------------------------------------------------------------- */}
                  {workspaceTab === 'server' && (
                    <div className="space-y-5 animate-fadeIn">
                      
                      {/* Active Daemons Table */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                          <span>Active Daemon Processes (Linux Systemd)</span>
                          <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Node: razak-server</span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-400">
                                <th className="p-2">PID</th>
                                <th className="p-2">Process Name</th>
                                <th className="p-2">Port</th>
                                <th className="p-2">CPU</th>
                                <th className="p-2">Memory</th>
                                <th className="p-2">Uptime</th>
                                <th className="p-2 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                              {serverDaemons.map(d => (
                                <tr key={d.pid} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                                  <td className="p-2 text-slate-400">{d.pid}</td>
                                  <td className="p-2 font-bold text-slate-900 dark:text-white">{d.name}</td>
                                  <td className="p-2 text-blue-600">{d.port}</td>
                                  <td className="p-2">{d.cpu}</td>
                                  <td className="p-2">{d.memory}</td>
                                  <td className="p-2 text-slate-500">{d.uptime}</td>
                                  <td className="p-2 text-right">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold ${
                                      d.status === 'Running' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                    }`}>
                                      {d.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mirror APIs */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                          <span>Simulated Kenyan Bank &amp; Payment Gateway Mirrors</span>
                          <span className="text-[10px] text-rose-600 font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">1 Incident Detected</span>
                        </h4>
                        <div className="space-y-2">
                          {mirrorApis.map((m, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                              m.alert ? 'border-rose-400 bg-rose-500/10 text-rose-900 dark:text-rose-200' : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40'
                            }`}>
                              <div>
                                <span className="font-bold block">{m.endpoint}</span>
                                <span className="text-[10px] text-slate-500">Port: {m.port} &middot; {m.protocol}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  m.alert ? 'bg-rose-600 text-white shadow-xs' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {m.status}
                                </span>
                                {m.alert && (
                                  <button
                                    onClick={() => showToast('Attempting daemon restart on port 8082...')}
                                    className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer transition-all"
                                  >
                                    Restart Socket
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* --------------------------------------------------------------------- */}
                  {/* SUB-TAB 4: USERS MANAGEMENT (P3L INTERNAL ROSTER) */}
                  {/* --------------------------------------------------------------------- */}
                  {workspaceTab === 'users' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                          P3L Core Operating Personnel (3 Founders &amp; Leads)
                        </h4>
                        <button
                          onClick={() => showToast('Direct invite link generated')}
                          className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                        >
                          + Invite Team Member
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 space-y-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">Guyoh Halake</span>
                          <span className="text-[10px] font-mono text-slate-500 block">Founder &amp; Chief Architect</span>
                          <span className="text-[10px] font-mono text-blue-600 block">p3lcodes@gmail.com</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[9.5px] font-mono font-bold uppercase inline-block">
                            Super Admin
                          </span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 space-y-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">Razak Guyo</span>
                          <span className="text-[10px] font-mono text-slate-500 block">Systems &amp; Server Lead</span>
                          <span className="text-[10px] font-mono text-blue-600 block">razak@p3ldev.com</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[9.5px] font-mono font-bold uppercase inline-block">
                            Systems Admin
                          </span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 space-y-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">Victor Karani</span>
                          <span className="text-[10px] font-mono text-slate-500 block">LegalTech Lead &amp; Reviewer</span>
                          <span className="text-[10px] font-mono text-blue-600 block">karani@p3ldev.com</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[9.5px] font-mono font-bold uppercase inline-block">
                            Legal Engineer
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* ========================================================================= */}
                {/* MARSABIT COUNTY MAP & INTERACTIVE DIAGNOSTICS */}
                {/* ========================================================================= */}
                <div 
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowDiagnosticsModal(true);
                  }}
                  className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4"
                  title="Right-click anywhere on the map to inspect full server diagnostics"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-red-500" />
                        P3L Headquarters &amp; Server Node: Marsabit County, Kenya
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Biftu Construction Company Station &middot; Marsabit Town &middot; Uplink to Azure Cloud
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                        GPS: 2.3333&deg; N, 37.9833&deg; E
                      </span>
                      <button
                        onClick={() => setShowDiagnosticsModal(true)}
                        className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        Inspect Server Telemetry
                      </button>
                    </div>
                  </div>

                  {/* Marsabit Embedded Map */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-60 shadow-inner relative">
                    <iframe
                      title="Marsabit County Server Node"
                      src="https://maps.google.com/maps?q=2.3333,37.9833&z=13&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'grayscale(25%)' }}
                      allowFullScreen={false}
                      loading="lazy"
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-full text-[10px] font-mono backdrop-blur-xs pointer-events-none border border-white/10 shadow-lg">
                      Right-click map for Full Server Diagnostics
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. PROJECTS AND CLIENTS TAB (FULL CRM VIEW) */}
            {/* ========================================================================= */}
            {activeTab === 'projects_clients' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                      Projects Fleet & Client CRM
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real accounts: Rosemary Wakonyo (Fresh City POS), Sarah Guyatu Rashid (Sayara Aesthetics), Nyagah Kithinji (Karani Law), and OdinBot
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddProjectModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black cursor-pointer shadow-xs"
                  >
                    + Add New Project
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            {p.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white font-brand">{p.name}</h3>
                        <p className="text-xs text-slate-500">Client: <strong>{p.client}</strong></p>
                        <p className="text-[11px] font-mono text-slate-400">Rate: {p.monthlyFee}</p>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 pt-1">Milestone: {p.nextMilestone}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400">{p.techStack.slice(0, 2).join(', ')}</span>
                        <button 
                          onClick={() => showToast(`Opening ${p.name}`)}
                          className="px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. USERS AND RBAC */}
            {/* ========================================================================= */}
            {activeTab === 'users_rbac' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    Access Control & Contributor RBAC
                  </h2>
                  <p className="text-xs text-slate-500">
                    Role templates, developer privileges, and client access limits
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block font-sans">Guyoh Halake</span>
                      <span className="text-[10px] text-slate-400">p3lcodes@gmail.com &middot; Founder / Lead Architect</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold">
                      Full Root Access
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block font-sans">Razak Guyo</span>
                      <span className="text-[10px] text-slate-400">razak@p3ldev.com &middot; Systems & Server Lead</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold">
                      Server Operations
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block font-sans">Victor Karani</span>
                      <span className="text-[10px] text-slate-400">karani@p3ldev.com &middot; LegalTech Lead</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold">
                      Legal Domain Admin
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. FINANCE AND BILLING */}
            {/* ========================================================================= */}
            {activeTab === 'finance_billing' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                      Finances, Retainers & Client Accounts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real startup cashflow: KES 8,000 this month &middot; KES 43,000 last 6 months
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowLogPaymentModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black cursor-pointer shadow-xs"
                  >
                    + Log Client Payment
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">This Month Received</span>
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">KES 8,000</span>
                    <span className="text-[10.5px] text-emerald-600 block">KES 3,200 from Sarah Rashid</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Last 6 Months</span>
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">KES 43,000</span>
                    <span className="text-[10.5px] text-slate-500 block">Fresh City POS setup + Sayara build</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Pending Invoices</span>
                    <span className="text-xl font-bold font-mono text-amber-600">KES 45,000</span>
                    <span className="text-[10.5px] text-slate-500 block">Karani Law stage 4 milestone</span>
                  </div>
                </div>

                {/* Clients billing roster */}
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-800/60 text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3">Client / Business</th>
                        <th className="p-3">Agreed Terms</th>
                        <th className="p-3">Initial Setup Fee</th>
                        <th className="p-3">Current Settlement</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 dark:text-white block font-sans">{c.name}</span>
                            <span className="text-[10px] text-slate-400">{c.company}</span>
                          </td>
                          <td className="p-3">{c.monthlyRetainer}</td>
                          <td className="p-3">{c.initialPaid}</td>
                          <td className="p-3 text-emerald-600 font-bold">{c.currentMonthPaid}</td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => {
                                setPaymentClient(c.name);
                                setShowLogPaymentModal(true);
                              }}
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[10px] font-bold cursor-pointer"
                            >
                              Add Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. AI AND INFRASTRUCTURE (ODINBOT OPERATIONS) */}
            {/* ========================================================================= */}
            {activeTab === 'ai_infra' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    OdinBot AI Engine & Local LLM Ops
                  </h2>
                  <p className="text-xs text-slate-500">
                    Autonomous agent telemetry, bank mirror integrations, and local model inference
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 space-y-2">
                  <span className="font-bold text-xs text-red-700 dark:text-red-400 font-mono block">
                    Current Blocker: I&M Bank Mirror 502 Bad Gateway
                  </span>
                  <p className="text-xs text-red-900 dark:text-red-300 font-mono">
                    Endpoint: <code>razak-server/mirrors/api/kenyanbanks/IandM</code>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    OdinBot tool-calling cannot query account balances until the local Python socket listener on port 8082 is re-initialized.
                  </p>
                  <button 
                    onClick={() => showToast('Restarting I&M Bank socket listener on razak-server...')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                  >
                    Restart I&M Bank Socket
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. CAREER AND EDUCATION */}
            {/* ========================================================================= */}
            {activeTab === 'career_education' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    Academic Coursework, Engineering Syllabus & Zoom Classes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Computer Science university syllabus, assignments, exams, and textbook library
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                      Assignments & Lab Projects
                    </h3>
                    <div className="space-y-2 font-mono text-xs">
                      {coursework.map(c => (
                        <div key={c.id} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block font-sans">{c.title}</span>
                            <span className="text-[10px] text-slate-400">{c.subject} &middot; {c.deadline}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold">
                            {c.marks}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                      Engineering PDF Library
                    </h3>
                    <div className="space-y-2 font-mono text-xs">
                      {readingPdfs.map((pdf, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 dark:text-white block truncate font-sans">{pdf.title}</span>
                            <span className="text-[10px] text-slate-400">{pdf.category} &middot; {pdf.pages}</span>
                          </div>
                          <button 
                            onClick={() => showToast(`Reading ${pdf.title}`)}
                            className="px-2 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold cursor-pointer shrink-0"
                          >
                            Open PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. INTERNAL P3L STAFF */}
            {/* ========================================================================= */}
            {activeTab === 'internal_staff' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    P3L Engineering & Core Leadership
                  </h2>
                  <p className="text-xs text-slate-500">
                    Internal founders, systems engineers, and legal domain contributors
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-brand">Guyoh Halake</h3>
                    <p className="text-xs text-slate-500">Founder & Chief Architect</p>
                    <p className="text-[11px] font-mono text-blue-600">p3lcodes@gmail.com</p>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 pt-2">
                      Leads full-stack architecture, Sayara API, POS integrations, and Karani Law platform build.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-brand">Razak Guyo</h3>
                    <p className="text-xs text-slate-500">Systems & Infrastructure Lead</p>
                    <p className="text-[11px] font-mono text-blue-600">razak@p3ldev.com</p>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 pt-2">
                      Oversees razak-server host, Marsabit network uplink, port bindings, and backup daemons.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-brand">Victor Karani</h3>
                    <p className="text-xs text-slate-500">LegalTech Engineering Lead</p>
                    <p className="text-[11px] font-mono text-blue-600">karani@p3ldev.com</p>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 pt-2">
                      Validates Advocates Remuneration Order calculations, High Court taxation scale accuracy, and legal UAT.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. MESSAGING */}
            {/* ========================================================================= */}
            {activeTab === 'comms_messaging' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    P3L Internal & Client Dispatch Stream
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time collaboration across client support channels
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-700">
                    <span className="font-bold text-slate-900 dark:text-white font-sans">Active Channel: #sayara-support</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Online</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-600 dark:text-zinc-300">
                      <strong>Sarah Rashid:</strong> Sent KES 3,200 via M-Pesa for this month's maintenance. Shein sync catalog working smoothly!
                    </p>
                    <p className="text-blue-600 dark:text-blue-400">
                      <strong>Guyo:</strong> Received, thank you Sarah. Monitoring the automated 18:00 cron run now.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 9. RAZAK SERVER INFRASTRUCTURE */}
            {/* ========================================================================= */}
            {activeTab === 'server' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn font-mono text-xs">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white font-sans">
                      Razak Server Central Diagnostics
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Host: Biftu Construction Co. Building, Marsabit &middot; Gateway to Azure Cloud
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDiagnosticsModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black cursor-pointer"
                  >
                    Full Hardware Dump
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Host Uptime</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">{formatUptime(uptimeSeconds)}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Network Latency</span>
                    <span className="text-base font-bold text-emerald-600">7 ms Local / 38ms Azure</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Memory Used</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">1.8 GB / 8.0 GB</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Mirror Sockets</span>
                    <span className="text-base font-bold text-amber-600">2 Active / 1 Error</span>
                  </div>
                </div>

                {/* Mirror APIs */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase text-slate-500">Kenyan Bank API Mirror Sockets</h4>
                  <div className="space-y-2">
                    {mirrorApis.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{m.endpoint}</span>
                          <span className="text-[10px] text-slate-400">Port {m.port} &middot; {m.protocol}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.alert ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 10. SUPPORT AND TICKETING */}
            {/* ========================================================================= */}
            {activeTab === 'support_ticketing' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    Client Support Desk & Incident Routing
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inbound client support tickets and maintenance requests
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block font-sans">Fresh City Supermarket: Barcode Scanner Roll Replacement</span>
                      <span className="text-[10px] text-slate-400">Rosemary Wakonyo &middot; Station POS-01</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Resolved</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block font-sans">Sayara Aesthetics: Shein Price Converter Currency Fluctuation</span>
                      <span className="text-[10px] text-slate-400">Sarah Guyatu Rashid &middot; E-commerce store</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">In Progress</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 11. SYSTEM WIPE & MASTER SNAPSHOTS */}
            {/* ========================================================================= */}
            {activeTab === 'system_wipe' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    System Snapshot Exports & Maintenance Controls
                  </h2>
                  <p className="text-xs text-slate-500">
                    Full master data exports, local cache purges, and emergency controls
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                      Export Full Master Snapshot
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      Creates a portable JSON backup including all projects, client contracts, tasks, and razak-server states.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black cursor-pointer shadow-xs"
                    >
                      Export Snapshot JSON
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-red-700 dark:text-red-400 font-mono">
                      Emergency Kill-Switch
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      Puts all client portal endpoints into read-only mode during structural maintenance.
                    </p>
                    <button
                      onClick={toggleMaintenance}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                        isMaintenanceMode ? 'bg-red-600 text-white animate-pulse' : 'bg-red-700 text-white hover:bg-red-800'
                      }`}
                    >
                      {isMaintenanceMode ? 'Deactivate Kill-Switch' : 'Activate Kill-Switch'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FULL SERVER DIAGNOSTICS (TRIGGERED BY RIGHT-CLICK ON MAP) */}
      {/* ========================================================================= */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-fadeIn font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-900 dark:text-white" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-brand">
                  Full Server Diagnostics: razak-server
                </h3>
              </div>
              <button 
                onClick={() => setShowDiagnosticsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-400">Station Node:</span><span className="font-bold text-slate-900 dark:text-white">Biftu Construction Co. Building, Marsabit Town, KE</span></div>
                <div className="flex justify-between"><span className="text-slate-400">GPS Coordinates:</span><span className="font-bold text-emerald-600">2.3333&deg; N, 37.9833&deg; E</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Public IP / Gateway:</span><span className="font-bold text-slate-900 dark:text-white">197.232.88.14 (Safaricom Dedicated Fiber + Starlink Node)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cloud Peers:</span><span className="font-bold text-blue-600">Azure Web App &middot; Vercel Edge &middot; Supabase Pool</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Local Loop Latency:</span><span className="font-bold text-emerald-600">7 ms</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Azure Roundtrip:</span><span className="font-bold text-slate-900 dark:text-white">38 ms</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Hardware Spec:</span><span className="font-bold text-slate-900 dark:text-white">Intel Core i7 (8 Cores), 32GB DDR4, 1TB NVMe SSD</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Kernel Version:</span><span className="font-bold text-slate-900 dark:text-white">Linux 5.15.0-89-generic (Ubuntu 22.04 LTS)</span></div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Mirror Gateway Directory:</span>
                <code className="p-2 rounded bg-slate-950 text-slate-200 block text-[11px] overflow-x-auto">
                  /opt/razak-server/mirrors/api/kenyanbanks/IandM<br/>
                  /opt/razak-server/mirrors/api/mpesa_b2c<br/>
                  /opt/razak-server/mirrors/api/sms_gateway
                </code>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold cursor-pointer"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RIGHT-CLICK DEPLOYMENT CONTEXT MENU */}
      {/* ========================================================================= */}
      {showDeploymentMenu && selectedDeployment && (
        <div 
          className="fixed inset-0 z-50 bg-black/20" 
          onClick={() => setShowDeploymentMenu(false)}
        >
          <div 
            style={{ top: Math.min(window.innerHeight - 200, deploymentMenuPos.y), left: Math.min(window.innerWidth - 240, deploymentMenuPos.x) }}
            className="absolute z-50 w-56 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-800 p-1.5 space-y-1 font-mono text-xs animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase truncate">
              {selectedDeployment.name}
            </div>
            <button
              onClick={() => {
                setShowDeploymentMenu(false);
                if (selectedDeployment.liveUrl.startsWith('http')) {
                  window.open(selectedDeployment.liveUrl, '_blank');
                } else {
                  showToast(`Live station: ${selectedDeployment.liveUrl}`);
                }
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Open Live URL</span>
            </button>
            <button
              onClick={() => {
                setShowDeploymentMenu(false);
                showToast(`Fetching deployment logs for ${selectedDeployment.name}...`);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspect Build Logs</span>
            </button>
            <button
              onClick={() => {
                setShowDeploymentMenu(false);
                showToast(`Daemon restart command dispatched to ${selectedDeployment.name}.`);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restart Worker Daemon</span>
            </button>
            <button
              onClick={() => {
                setShowDeploymentMenu(false);
                showToast(`Displaying environment secrets for ${selectedDeployment.name}`);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>View Secrets</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD PROJECT */}
      {/* ========================================================================= */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                Register New P3L Project
              </h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sayara New Delivery Portal"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Client Name / Business</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Guyatu Rashid"
                  value={newProjectClient}
                  onChange={e => setNewProjectClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Category</label>
                  <select 
                    value={newProjectCategory}
                    onChange={e => setNewProjectCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                  >
                    <option value="Retail & POS">Retail & POS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Automation & API">Automation & API</option>
                    <option value="LegalTech SaaS">LegalTech SaaS</option>
                    <option value="AI & Automation">AI & Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Monthly Fee / Retainer</label>
                  <input 
                    type="text" 
                    value={newProjectFee}
                    onChange={e => setNewProjectFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddProjectModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-black cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD TASK */}
      {/* ========================================================================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                Add Founder Priority Task
              </h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Task Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Verify Shein catalog sync webhook"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Category</label>
                  <select 
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                  >
                    <option value="work">Work / Client Sprint</option>
                    <option value="personal">Personal / University Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Bug / Blocker</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-black cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer">
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: LOG CLIENT PAYMENT */}
      {/* ========================================================================= */}
      {showLogPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                Log Inbound Client Settlement
              </h3>
              <button onClick={() => setShowLogPaymentModal(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Client Source</label>
                <select 
                  value={paymentClient}
                  onChange={e => setPaymentClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono"
                >
                  <option value="Sarah Guyatu Rashid (Sayara Aesthetics)">Sarah Guyatu Rashid (Sayara Aesthetics)</option>
                  <option value="Rosemary Wakonyo (Fresh City Supermarket)">Rosemary Wakonyo (Fresh City POS)</option>
                  <option value="Adv. Nyagah B. Kithinji (Karani Law)">Adv. Nyagah B. Kithinji (Karani Law)</option>
                  <option value="Other Inbound Client">Other Inbound Client</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Amount (KES)</label>
                <input 
                  type="number" 
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 mb-1">Notes / Description</label>
                <input 
                  type="text" 
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowLogPaymentModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-black cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
