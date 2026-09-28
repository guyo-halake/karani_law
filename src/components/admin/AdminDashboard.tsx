import React, { useState, useEffect } from 'react';
import { 
  Users, Server, HardDrive, Calculator, 
  Briefcase, Paintbrush, Settings, LayoutDashboard,
  Search, Bell, Info, Globe, Activity, Database, Edit, Trash2, Eye, Grid, List, LogOut, ChevronDown,
  MapPin, Radio, ShieldAlert, Cpu, ArrowUpRight, CheckCircle2, Clock, Terminal, Zap, Power,
  CheckCircle, GitCommit, GitPullRequest, Layers, HardDriveDownload
} from 'lucide-react';
import { FiCommand, FiActivity, FiTerminal, FiGitBranch, FiCloudLightning, FiCpu, FiHardDrive } from 'react-icons/fi';
import { SiVercel, SiGithub } from 'react-icons/si';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [livePktStream, setLivePktStream] = useState(1420);
  const [isLockedDown, setIsLockedDown] = useState(false);

  // Real-time ticking for activity feed
  const [feedTimes, setFeedTimes] = useState({
    vercel1: 14,
    github1: 85,
    vercel2: 260,
    github2: 520
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedTimes(prev => ({
        vercel1: prev.vercel1 + 1,
        github1: prev.github1 + 1,
        vercel2: prev.vercel2 + 1,
        github2: prev.github2 + 1,
      }));
      setLivePktStream(prev => Math.floor(1400 + Math.random() * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (msg: string) => alert(`Action Triggered: ${msg}`);
  const orbClick = () => alert("Matta AI GPT-4.3 is Online and ready for execution.");

  const toggleEmergencyLockdown = () => {
    if (!isLockedDown) {
      const confirmKill = window.confirm("WARNING: Kill switch will shut down all active server instances and trigger 503 maintenance across all endpoints. Proceed?");
      if (confirmKill) {
        setIsLockedDown(true);
        alert("CRITICAL: Kill switch engaged. All servers stopped.");
      }
    } else {
      setIsLockedDown(false);
      alert("Servers resumed normal operation.");
    }
  };

  // Calculate days since Sep 23, 2017
  const startDate = new Date('2017-09-23');
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


  const sidebarNav = [
    { id: 'dashboard', icon: <FiCommand size={17} strokeWidth={1.5} />, label: 'Dashboard' },
    { id: 'users', icon: <Users size={17} strokeWidth={1.5} />, label: 'Users & Access' },
    { id: 'server', icon: <FiCpu size={17} strokeWidth={1.5} />, label: 'Server & Database' },
    { id: 'storage', icon: <FiHardDrive size={17} strokeWidth={1.5} />, label: 'Storage Vault' },
    { id: 'boc', icon: <Calculator size={17} strokeWidth={1.5} />, label: 'Fee Notes' },
    { id: 'crm', icon: <Briefcase size={17} strokeWidth={1.5} />, label: 'CRM Control' },
    { id: 'branding', icon: <Paintbrush size={17} strokeWidth={1.5} />, label: 'Theme & Branding' },
    { id: 'system', icon: <Settings size={17} strokeWidth={1.5} />, label: 'System Wipe' }
  ];

  const projects = [
    { name: 'Sayara Aesthetics Shop', client: 'SR', url: '192.168.1.101', domain: 'sayarashop.co.ke', avatar: 'S', vercelUrl: '' },
    { name: 'OdinBot Framework', client: 'P3L', url: '10.0.0.5', domain: 'odin.p3l.dev', avatar: 'O', vercelUrl: '' },
    { name: 'Karani Law / Billszip', client: 'RM', url: '192.168.1.105', domain: 'karani.law', avatar: 'K', vercelUrl: 'https://vercel.com/razaks-projects-458390b4/karani-law' },
    { name: 'Nokras Web Server', client: 'NW', url: '192.168.1.108', domain: 'nokras.com', avatar: 'N', vercelUrl: '' },
    { name: 'AO Tech CI/CD Workflow', client: 'AO', url: '10.0.1.20', domain: 'ci.aotech.dev', avatar: 'A', vercelUrl: '' },
    { name: 'AO Tech B2C Mobile Pay', client: 'AO', url: '10.0.1.21', domain: 'pay.aotech.dev', avatar: 'A', vercelUrl: '' },
    { name: 'Razak Personal Site', client: 'P3L', url: '10.0.0.10', domain: 'razakcodes.dev', avatar: 'R', vercelUrl: '' },
    { name: 'Matta AI Core', client: 'P3L', url: '10.0.0.15', domain: 'matta.ai', avatar: 'M', vercelUrl: '' },
    { name: 'Fintech Ledger API', client: 'FL', url: '192.168.2.50', domain: 'api.ledger.co', avatar: 'F', vercelUrl: '' },
    { name: 'Mombasa Port DB', client: 'MP', url: '192.168.2.55', domain: 'db.mombasa.gov', avatar: 'M', vercelUrl: '' },
    { name: 'School Work Archive', client: 'RM', url: '10.0.0.50', domain: 'archive.edu', avatar: 'S', vercelUrl: '' },
    { name: 'Crypto Trading Bot', client: 'P3L', url: '10.0.0.99', domain: 'trade.p3l.dev', avatar: 'C', vercelUrl: '' },
  ];

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 4);

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#fafafa] text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* 1. Full Executive Sidebar with Icons & Text Labels */}
      <aside className="w-64 flex flex-col py-5 px-3 border-r border-gray-200 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20 shrink-0">
        {/* Sidebar Brand Header */}
        <div className="px-3 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs">
              P2L
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">Admin Console</p>
              <p className="text-[10px] text-gray-400 font-mono">v2.6.4 Production</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Live"></span>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex flex-col gap-1 flex-1 w-full overflow-y-auto pr-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1 font-mono">
            Navigation
          </span>
          {sidebarNav.map((nav) => (
            <button 
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === nav.id 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === nav.id ? 'text-white' : 'text-gray-500'}>
                  {nav.icon}
                </span>
                <span className="truncate">{nav.label}</span>
              </div>
              {activeTab === nav.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Dock with System Status & Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100 space-y-1.5">
          <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200/70 flex items-center justify-between text-[10.5px] font-mono text-gray-500">
            <span className="flex items-center gap-1.5 font-bold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Core Status
            </span>
            <span className="text-black font-semibold">456 api/ms</span>
          </div>

          <button 
            onClick={() => handleAction('System Diagnostics')} 
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <Info size={16} strokeWidth={1.5} className="text-gray-400" />
            <span>System Diagnostics</span>
          </button>

          <button 
            onClick={() => handleAction('Logged Out')} 
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#fafafa]">
        
        {/* TOP HEADER: P2L Logo on topbar replacing guyesacodes/ */}
        <div className="px-8 py-3 w-full flex justify-between items-center border-b border-gray-200 bg-white/90 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3.5">
            <img 
              src="/p2l_logo.jpeg" 
              alt="P2L Logo" 
              className="h-10 w-auto max-h-11 object-contain rounded-xl border border-gray-200/80 shadow-xs bg-white p-1"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-black flex items-center gap-2" style={{ fontFamily: '"Sora", sans-serif' }}>
                P2L Developer Admin
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  LIVE
                </span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">
                Core Operations & System Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
              <Search size={16} strokeWidth={1.5} />
            </button>
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors relative">
              <Bell size={16} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white"></span>
            </button>
            
            {/* Avatar Dropdown Area */}
            <div className="flex items-center gap-3 pl-2 pr-2 py-1 cursor-pointer group hover:bg-gray-50 rounded-md transition-colors relative border border-transparent hover:border-gray-200">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80" alt="Razak Avatar" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
              <div className="hidden md:flex flex-col pr-4">
                <p className="text-xs font-bold leading-tight text-gray-900">Guyo Razak, P3L Admin</p>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-[9px]" />
              </div>
              {/* Hover Dropdown Email */}
              <div className="absolute top-10 right-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-xl whitespace-nowrap font-mono">
                  razakcodes@p3ldev.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-24 pt-6">
          <div className="max-w-[1440px] mx-auto">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6 relative">
                
                {/* Floating AI Orb (Matta) */}
                <button onClick={orbClick} className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-white border border-gray-200 shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50 overflow-hidden cursor-pointer group" title="Matta AI Core">
                  <div className="w-10 h-10 rounded-full border border-blue-500/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                  <FiCloudLightning className="w-5 h-5 text-blue-600 absolute group-hover:text-black transition-colors" />
                </button>

                {/* Welcome Section & Quick Actions */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border border-gray-200 pb-6 bg-white p-6 rounded-2xl shadow-xs">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Hi, Razakkk,</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] font-mono uppercase tracking-widest text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                        Total Users: <strong className="text-black">4,281</strong>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Server Uptime: <strong className="text-emerald-600">99.8%</strong>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>Sep 23 2017 ({diffDays} Days)</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => handleAction('New P3L Project')} className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors border border-black shadow-xs">
                      + New P3L Project
                    </button>
                    <button onClick={() => handleAction('School Work')} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-xs">
                      School Work
                    </button>
                    <button onClick={() => handleAction('Raz Server Page')} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-xs">
                      Raz Server Page
                    </button>
                  </div>
                </div>

                {/* 2 Mini Graph Cards (Green & Red) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Incoming Packets</p>
                        <h3 className="text-2xl font-bold text-black" style={{ fontFamily: '"Sora", sans-serif' }}>84.2M</h3>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100">+14.5%</span>
                    </div>
                    {/* SVG Sparkline Mock - Green */}
                    <svg className="absolute bottom-0 left-0 w-full h-16 opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,80 C20,60 40,90 60,40 C80,-10 90,30 100,20 L100,100 Z" fill="#10b981" />
                      <path d="M0,80 C20,60 40,90 60,40 C80,-10 90,30 100,20" fill="none" stroke="#059669" strokeWidth="2" />
                    </svg>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Dropped Requests</p>
                        <h3 className="text-2xl font-bold text-black" style={{ fontFamily: '"Sora", sans-serif' }}>0.04%</h3>
                      </div>
                      <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">-2.1%</span>
                    </div>
                    {/* SVG Sparkline Mock - Red */}
                    <svg className="absolute bottom-0 left-0 w-full h-16 opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,90 C20,95 40,70 60,85 C80,100 90,60 100,50 L100,100 Z" fill="#ef4444" />
                      <path d="M0,90 C20,95 40,70 60,85 C80,100 90,60 100,50" fill="none" stroke="#dc2626" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* The "Big Three" Features */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* 1. API Traffic Heatmap (Real GitHub Style) */}
                  <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <FiActivity className="w-4 h-4 text-black" />
                      <h4 className="text-xs font-mono uppercase tracking-widest text-black font-bold">API Traffic Heatmap</h4>
                    </div>
                    <div className="flex flex-wrap gap-[2px] flex-1">
                      {Array.from({ length: 140 }).map((_, i) => {
                        const intensity = Math.random();
                        let bgClass = 'bg-[#ebedf0]'; // github empty gray
                        if (intensity > 0.8) bgClass = 'bg-[#216e39]'; // dark green
                        else if (intensity > 0.6) bgClass = 'bg-[#30a14e]';
                        else if (intensity > 0.4) bgClass = 'bg-[#40c463]';
                        else if (intensity > 0.2) bgClass = 'bg-[#9be9a8]'; // light green
                        return <div key={i} className={`w-[10px] h-[10px] rounded-[1px] ${bgClass}`}></div>
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-4 text-[10px] text-gray-500 font-mono">
                      <span>Less</span>
                      <div className="flex gap-[2px]">
                        <div className="w-[10px] h-[10px] rounded-[1px] bg-[#ebedf0]"></div>
                        <div className="w-[10px] h-[10px] rounded-[1px] bg-[#9be9a8]"></div>
                        <div className="w-[10px] h-[10px] rounded-[1px] bg-[#40c463]"></div>
                        <div className="w-[10px] h-[10px] rounded-[1px] bg-[#30a14e]"></div>
                        <div className="w-[10px] h-[10px] rounded-[1px] bg-[#216e39]"></div>
                      </div>
                      <span>More</span>
                    </div>
                  </div>

                  {/* 2. LIVE REALTIME SATELLITE TERRAIN MAP WITH RED PIN */}
                  <div className="p-0 rounded-2xl border border-gray-800 bg-[#0b101b] shadow-lg overflow-hidden relative group h-[300px] flex flex-col">
                    
                    {/* Top Badge Only */}
                    <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                      <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-700/80 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[9.5px] font-mono text-emerald-400 font-bold pointer-events-auto">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>SATELLITE TERRAIN</span>
                      </div>
                    </div>

                    {/* Satellite & Topography Terrain Map Container - ZOOMED IN */}
                    <div className="w-full h-full relative overflow-hidden">
                      <iframe 
                        title="Satellite Terrain Map"
                        width="100%" 
                        height="100%" 
                        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3988.86720478058!2d38.0309!3d2.3317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske" 
                        style={{ border: 0, filter: 'contrast(1.15) saturate(1.2)' }}
                        className="w-full h-full scale-110 pointer-events-auto opacity-90"
                      ></iframe>

                      {/* Animated Real-time Radar Scan Wave */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                        <div className="w-[340px] h-[340px] rounded-full border border-emerald-500/20 animate-[spin_8s_linear_infinite] flex items-center justify-center">
                          <div className="w-[200px] h-[200px] rounded-full border border-emerald-500/30 border-dashed animate-[spin_12s_linear_infinite_reverse]"></div>
                          <div className="absolute top-0 right-1/2 w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-tl-full origin-bottom-right"></div>
                        </div>
                      </div>

                      {/* Realtime Live Moving Signal Packets (SVG Trails) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 300 200" preserveAspectRatio="none">
                        <path d="M 30,160 Q 150,40 270,160" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" className="opacity-40" />
                        <path d="M 60,50 Q 150,110 240,50" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" className="opacity-30" />
                        <circle cx="150" cy="110" r="2" fill="#ef4444" className="animate-ping" />
                      </svg>

                      {/* RED MAP PIN with Beacon and Live Tooltip */}
                      <div className="absolute top-[52%] left-[50%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center pointer-events-auto cursor-pointer group/pin">
                        <div className="mb-2 opacity-0 group-hover/pin:opacity-100 transition-opacity bg-zinc-950/95 backdrop-blur-md text-white text-[10px] font-mono px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap border border-zinc-700 pointer-events-none">
                          <p className="font-bold text-red-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                            Sagante Regional Node
                          </p>
                          <p className="text-zinc-300">Lat: 2.3317° N • Lon: 38.0309° E</p>
                          <p className="text-emerald-400 font-semibold mt-0.5">Terrain Altitude: 1,482m • 456 api/ms</p>
                        </div>
                        
                        {/* 3D Red Vector Pin */}
                        <div className="relative transform group-hover/pin:scale-125 transition-transform duration-200">
                          <svg className="w-8 h-8 drop-shadow-[0_4px_10px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24" fill="none">
                            <path 
                              d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 14 1-1 8-8.75 8-14 0-4.42-3.58-8-8-8z" 
                              fill="#ef4444" 
                              stroke="#991b1b" 
                              strokeWidth="1.2"
                            />
                            <circle cx="12" cy="8" r="3.2" fill="#ffffff" />
                            <circle cx="12" cy="8" r="1.6" fill="#dc2626" />
                          </svg>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-600 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-red-500/30 rounded-full blur-xs"></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Telemetry Bar */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
                      <div className="bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-700/80 text-[9.5px] font-mono text-zinc-300 flex items-center gap-2.5 shadow-md">
                        <span>LAT: 2°19'54"N</span>
                        <span>LON: 38°01'51"E</span>
                        <span className="text-emerald-400">ALT: 1,482m</span>
                      </div>
                      <div className="bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-700/80 text-[9.5px] font-mono text-emerald-400 font-bold shadow-md">
                        STREAM: {livePktStream} pkts/s
                      </div>
                    </div>
                  </div>

                  {/* 3. Live Real-time Activity Feed with 4 Vercel & GitHub Entries */}
                  <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FiTerminal className="w-4 h-4 text-black" />
                          <h4 className="text-xs font-mono uppercase tracking-widest text-black font-bold">Activity Feed</h4>
                        </div>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          REALTIME
                        </span>
                      </div>

                      {/* 4 Activity Feeds for Vercel & GitHub */}
                      <div className="space-y-3.5 relative">
                        {/* Feed 1: Vercel Production Deploy */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <SiVercel size={11} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 truncate">Vercel: Production Deploy Succeeded</p>
                              <span className="text-[9.5px] font-mono text-gray-400 shrink-0">{feedTimes.vercel1}s ago</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              karani-law-main (dpl_82fa) • Nairobi Edge af-south-1
                            </p>
                          </div>
                        </div>

                        {/* Feed 2: GitHub PR Merged */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <SiGithub size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 truncate">GitHub: PR #42 Merged to main</p>
                              <span className="text-[9.5px] font-mono text-gray-400 shrink-0">{Math.floor(feedTimes.github1 / 60)}m {feedTimes.github1 % 60}s ago</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              feat(auth): biometric & Supabase RLS policies by @karani-law
                            </p>
                          </div>
                        </div>

                        {/* Feed 3: Vercel Edge Cache Invalidation */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <SiVercel size={11} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 truncate">Vercel: Edge Function Cache Invalidation</p>
                              <span className="text-[9.5px] font-mono text-gray-400 shrink-0">{Math.floor(feedTimes.vercel2 / 60)}m ago</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              ISR revalidation triggered for /api/v1/feenotes
                            </p>
                          </div>
                        </div>

                        {/* Feed 4: GitHub CI/CD Automated Regression */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <SiGithub size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 truncate">GitHub: CI/CD Workflow Passed</p>
                              <span className="text-[9.5px] font-mono text-gray-400 shrink-0">{Math.floor(feedTimes.github2 / 60)}m ago</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              Workflow #189: automated billing tests & security scan 100%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>4 Event Streams Connected</span>
                      <span className="text-emerald-600 font-bold">100% HEALTH</span>
                    </div>
                  </div>
                </div>

                {/* Minimalist Cards Below the Big Three: Storage & Emergency Red Kill Switch with 3 Processes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* NVMe Storage / Server */}
                  <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2 mb-6">
                        <FiHardDrive className="w-4 h-4"/> NVMe Storage / Razak Server
                      </h4>
                      
                      <div className="mb-5">
                        <div className="flex justify-between text-[11px] font-mono text-gray-500 mb-1.5 uppercase">
                          <span>34% used</span>
                          <span className="text-black font-semibold">26GB / 125GB</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-black h-2 rounded-full w-[34%]"></div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] font-mono text-gray-500 mb-1.5 uppercase">
                          <span>Full Server Cluster</span>
                          <span className="text-black font-semibold">4.7TB / 9.5TB</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-black h-2 rounded-full w-[49%]"></div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleAction('Open Server Storage')} className="w-max mt-2 px-4 py-2 text-xs font-bold text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs cursor-pointer">
                      Open Server Storage
                    </button>
                  </div>

                  {/* GLOBAL MAINTENANCE: RED BUTTON, "Kill switch all server running", AND 3 PROCESSES */}
                  <div className="p-6 rounded-2xl border border-red-200 bg-red-50/60 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-red-700 font-bold flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          Global Maintenance
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                          {isLockedDown ? 'LOCKED DOWN' : 'ARMED'}
                        </span>
                      </div>

                      {/* The 3 Core Processes Requested */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 mt-3">
                        {/* Process 1: Matta Ai Gpt 4.3 */}
                        <div className="p-2.5 bg-white/90 rounded-xl border border-red-200 shadow-xs flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold text-gray-500">PROC #1</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">Matta Ai Gpt 4.3</p>
                          <p className="text-[10px] font-mono text-emerald-600 mt-1">Status: Active</p>
                        </div>

                        {/* Process 2: Process Call: 456 api/ms */}
                        <div className="p-2.5 bg-white/90 rounded-xl border border-red-200 shadow-xs flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold text-gray-500">PROC #2</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">Process Call</p>
                          <p className="text-[10px] font-mono text-blue-600 font-bold mt-1">456 api/ms</p>
                        </div>

                        {/* Process 3: Storage Server 6.8 TB (4 available, 2 available) */}
                        <div className="p-2.5 bg-white/90 rounded-xl border border-red-200 shadow-xs flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-bold text-gray-500">PROC #3</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">Storage Server</p>
                          <p className="text-[10px] font-mono text-gray-800 font-bold">6.8 TB</p>
                          <p className="text-[9.5px] font-mono text-purple-700 font-medium">4 available, 2 available</p>
                        </div>
                      </div>
                    </div>

                    {/* RED EMERGENCY BUTTON & TEXT UNDERNEATH */}
                    <div>
                      <button 
                        onClick={toggleEmergencyLockdown}
                        className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs uppercase tracking-widest rounded-xl border border-red-700 shadow-md shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                      >
                        <Power className="w-4 h-4 text-white" />
                        <span>{isLockedDown ? 'RESUME ALL SERVERS' : 'DATABASE KILL SWITCH'}</span>
                      </button>
                      <p className="text-center text-[11px] font-bold text-red-600 mt-2 font-mono uppercase tracking-wider">
                        Kill switch all server running
                      </p>
                    </div>
                  </div>
                </div>

                {/* The P3L Master Projects Table with ALWAYS VISIBLE Action Buttons */}
                <div className="p-0 rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                  <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4"/> P3L P/C Master Projects
                    </h3>
                    
                    <div className="flex items-center gap-1 bg-gray-200/50 p-1 rounded-lg border border-gray-200">
                      <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white shadow-xs text-black border border-gray-200' : 'text-gray-500 hover:text-black'}`}>
                        <List size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md ${viewMode === 'card' ? 'bg-white shadow-xs text-black border border-gray-200' : 'text-gray-500 hover:text-black'}`}>
                        <Grid size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-mono text-gray-500 border-b border-gray-200 uppercase tracking-widest bg-white">
                            <th className="py-3.5 pl-6 font-semibold">Project</th>
                            <th className="py-3.5 font-semibold">Client</th>
                            <th className="py-3.5 font-semibold">Server URL</th>
                            <th className="py-3.5 font-semibold">Domain</th>
                            <th className="py-3.5 pr-6 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {visibleProjects.map((p, i) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                              <td className="py-3.5 pl-6 font-medium text-black flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-black font-bold font-mono">
                                  {p.avatar}
                                </div>
                                <span className="font-semibold text-gray-900">{p.name}</span>
                              </td>
                              <td className="py-3.5 text-xs text-gray-600 font-mono font-medium">{p.client}</td>
                              <td className="py-3.5 font-mono text-[11px] text-gray-500">{p.url}</td>
                              <td className="py-3.5 text-xs text-black font-mono">{p.domain}</td>
                              <td className="py-3.5 pr-6 text-right">
                                {/* ACTION BUTTONS: MUST BE VISIBLE AT ALL TIMES (NOT HIDDEN ON HOVER) */}
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => p.vercelUrl ? window.open(p.vercelUrl, '_blank') : handleAction(`View ${p.name}`)} 
                                    className="p-1.5 text-gray-600 hover:text-black border border-gray-200 bg-white hover:bg-gray-100 rounded-lg transition-all shadow-2xs cursor-pointer"
                                    title={`View ${p.name}`}
                                  >
                                    <Eye size={14} strokeWidth={1.75} />
                                  </button>
                                  <button 
                                    onClick={() => handleAction(`Edit ${p.name}`)} 
                                    className="p-1.5 text-blue-600 hover:text-blue-700 border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-all shadow-2xs cursor-pointer"
                                    title={`Edit ${p.name}`}
                                  >
                                    <Edit size={14} strokeWidth={1.75} />
                                  </button>
                                  <button 
                                    onClick={() => handleAction(`Delete ${p.name}`)} 
                                    className="p-1.5 text-red-600 hover:text-red-700 border border-red-200/80 bg-red-50/50 hover:bg-red-100 rounded-lg transition-all shadow-2xs cursor-pointer"
                                    title={`Delete ${p.name}`}
                                  >
                                    <Trash2 size={14} strokeWidth={1.75} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6 bg-gray-50/30">
                      {visibleProjects.map((p, i) => (
                        <div key={i} className="p-4 border border-gray-200 rounded-xl bg-white shadow-xs hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-black font-mono">
                              {p.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-black leading-tight truncate">{p.name}</h4>
                              <span className="text-[9px] font-bold text-gray-500 uppercase font-mono tracking-widest">{p.client}</span>
                            </div>
                          </div>
                          <div className="space-y-1 mb-4">
                            <p className="text-[10px] font-mono text-gray-500 flex justify-between"><span>URL</span><span className="text-black font-semibold">{p.url}</span></p>
                            <p className="text-[10px] font-mono text-gray-500 flex justify-between"><span>Domain</span><span className="text-black font-semibold">{p.domain}</span></p>
                          </div>
                          {/* Card Action Buttons: Visible at all times */}
                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
                            <button onClick={() => p.vercelUrl ? window.open(p.vercelUrl, '_blank') : handleAction(`View ${p.name}`)} className="p-1.5 text-gray-600 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-50 text-xs flex items-center gap-1 font-medium">
                              <Eye size={13} /> View
                            </button>
                            <button onClick={() => handleAction(`Edit ${p.name}`)} className="p-1.5 text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50/40 rounded-lg text-xs flex items-center gap-1 font-medium">
                              <Edit size={13} /> Edit
                            </button>
                            <button onClick={() => handleAction(`Delete ${p.name}`)} className="p-1.5 text-red-600 hover:text-red-700 border border-red-200 bg-red-50/40 rounded-lg text-xs flex items-center gap-1 font-medium">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="py-3 text-center border-t border-gray-200 bg-gray-50/50">
                    <button 
                      onClick={() => setShowAllProjects(!showAllProjects)}
                      className="px-6 py-1 text-xs font-mono font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      {showAllProjects ? 'Collapse List' : `Load More (${projects.length - 4})`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========== USERS & ACCESS TAB ========== */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Users & Access Control</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">Manage platform users, roles, and permissions across all P3L projects</p>
                  </div>
                  <button onClick={() => handleAction('Invite User')} className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-xs">+ Invite User</button>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: '4,281', change: '+12%', color: 'emerald' },
                    { label: 'Active Now', value: '342', change: 'Live', color: 'blue' },
                    { label: 'Admin Roles', value: '8', change: 'Stable', color: 'purple' },
                    { label: 'Pending Invites', value: '14', change: 'Review', color: 'amber' },
                  ].map((stat, i) => (
                    <div key={i} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-black" style={{ fontFamily: '"Sora", sans-serif' }}>{stat.value}</h3>
                      <span className={`text-[10px] font-bold text-${stat.color}-600 mt-1 inline-block`}>{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Users Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2"><Users className="w-4 h-4"/> Platform Users</h3>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Search users..." className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10 w-56" />
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-mono text-gray-500 border-b border-gray-200 uppercase tracking-widest">
                        <th className="py-3 pl-6">User</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Role</th>
                        <th className="py-3">Last Active</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { name: 'Guyo Razak', email: 'razakcodes@p3ldev.com', role: 'Super Admin', lastActive: '2 min ago', status: 'Online' },
                        { name: 'Karani Victor', email: 'vickarani@gmail.com', role: 'Client Admin', lastActive: '1h ago', status: 'Online' },
                        { name: 'Sarah Mwangi', email: 'sarah@aotech.dev', role: 'Developer', lastActive: '3h ago', status: 'Away' },
                        { name: 'Abdul Hassan', email: 'abdul@nokras.com', role: 'Client User', lastActive: '1 day ago', status: 'Offline' },
                        { name: 'Matta AI', email: 'matta@p3l.dev', role: 'System Agent', lastActive: 'Always', status: 'Online' },
                        { name: 'James Oloo', email: 'james@sayarashop.co.ke', role: 'Client User', lastActive: '5h ago', status: 'Away' },
                      ].map((u, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 pl-6 font-semibold text-black">{u.name}</td>
                          <td className="py-3 text-xs text-gray-500 font-mono">{u.email}</td>
                          <td className="py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            u.role === 'Super Admin' ? 'bg-black text-white border-black' :
                            u.role === 'System Agent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>{u.role}</span></td>
                          <td className="py-3 text-xs text-gray-500 font-mono">{u.lastActive}</td>
                          <td className="py-3"><span className={`flex items-center gap-1.5 text-xs font-semibold ${
                            u.status === 'Online' ? 'text-emerald-600' : u.status === 'Away' ? 'text-amber-600' : 'text-gray-400'
                          }`}><span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'Online' ? 'bg-emerald-500' : u.status === 'Away' ? 'bg-amber-500' : 'bg-gray-300'
                          }`}></span>{u.status}</span></td>
                          <td className="py-3 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleAction(`Edit ${u.name}`)} className="p-1.5 text-blue-600 border border-blue-200 bg-blue-50/50 rounded-lg text-xs"><Edit size={13} /></button>
                              <button onClick={() => handleAction(`Remove ${u.name}`)} className="p-1.5 text-red-600 border border-red-200 bg-red-50/50 rounded-lg text-xs"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== SERVER & DATABASE TAB ========== */}
            {activeTab === 'server' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Server & Database Operations</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">Monitor uptime, track errors, and manage deployments across all P3L infrastructure</p>
                </div>

                {/* Global Uptime Monitor */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xs p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2 mb-5">
                    <Activity className="w-4 h-4 text-emerald-600" /> Global Platform Uptime Monitor
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { endpoint: 'FastAPI Backend', url: 'localhost:8000', uptime: '99.92%', status: 'Healthy', latency: '12ms' },
                      { endpoint: 'Vite Frontend', url: 'localhost:3000', uptime: '99.98%', status: 'Healthy', latency: '3ms' },
                      { endpoint: 'Supabase DB', url: 'supabase.co', uptime: '99.99%', status: 'Healthy', latency: '45ms' },
                    ].map((ep, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-black">{ep.endpoint}</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{ep.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-500">{ep.url}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-black text-black">{ep.uptime}</span>
                          <span className="text-[10px] font-mono text-gray-500">Latency: {ep.latency}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: ep.uptime }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Uptime Timeline (7 days) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400 w-14 shrink-0">7d ago</span>
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-6 rounded-sm ${
                        Math.random() > 0.05 ? 'bg-emerald-500' : 'bg-red-500'
                      }`} title={`${Math.random() > 0.05 ? '100%' : 'Incident'}`}></div>
                    ))}
                    <span className="text-[10px] font-mono text-gray-400 w-10 shrink-0 text-right">Now</span>
                  </div>
                </div>

                {/* Unresolved 500 Errors Splat */}
                <div className="rounded-2xl border border-red-200 bg-red-50/40 shadow-xs p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-red-700 font-bold flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-4 h-4" /> Unresolved Error Splat — 500 Server Errors
                  </h3>
                  <div className="space-y-3">
                    {[
                      { path: '/api/v1/feenotes/import', error: 'UnicodeDecodeError: codec can\'t decode byte 0x92', time: '14m ago', count: 3 },
                      { path: '/api/v1/boc/calculate', error: 'KeyError: \'instruction_fee_percentage\'', time: '2h ago', count: 1 },
                      { path: '/api/v1/auth/refresh', error: 'JWT token expired — refresh cycle failed', time: '6h ago', count: 7 },
                    ].map((err, i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-red-200 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-red-800 font-mono">{err.path}</p>
                          <p className="text-[11px] text-red-600 mt-1 truncate">{err.error}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">{err.time} • {err.count} occurrence(s)</p>
                        </div>
                        <button onClick={() => handleAction(`Fix ${err.path}`)} className="px-3 py-1.5 text-xs font-bold text-red-700 border border-red-300 bg-red-100 rounded-lg hover:bg-red-200 transition-colors shrink-0">Investigate</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick-Action Deployment Trigger */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xs p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2 mb-4">
                    <Terminal className="w-4 h-4" /> Quick-Action Deployment Trigger
                  </h3>
                  <p className="text-xs text-gray-500 mb-5">Execute <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">git pull && restart</code> across your projects directly from here — no terminal needed.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: 'Karani Law / Billszip', status: 'Ready' },
                      { name: 'OdinBot Framework', status: 'Ready' },
                      { name: 'Matta AI Core', status: 'Ready' },
                    ].map((dep, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-black">{dep.name}</p>
                          <p className="text-[10px] font-mono text-emerald-600 mt-0.5">⬤ {dep.status}</p>
                        </div>
                        <button onClick={() => handleAction(`Deploy ${dep.name}`)} className="px-3 py-2 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider">
                          <ArrowUpRight className="w-3 h-3 inline mr-1" />Deploy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== STORAGE VAULT TAB ========== */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Storage Vault</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">Centralized view of all NVMe, cloud, and database storage across the P3L network</p>
                </div>

                {/* Storage Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'NVMe Primary', used: 26, total: 125, unit: 'GB', color: 'bg-black' },
                    { label: 'Full Server Cluster', used: 4.7, total: 9.5, unit: 'TB', color: 'bg-blue-600' },
                    { label: 'Supabase Storage', used: 1.2, total: 8, unit: 'GB', color: 'bg-purple-600' },
                  ].map((s, i) => (
                    <div key={i} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-black">{s.label}</span>
                        <span className="text-[10px] font-mono text-gray-500">{Math.round((s.used / s.total) * 100)}% used</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2">
                        <div className={`${s.color} h-3 rounded-full`} style={{ width: `${(s.used / s.total) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-500">
                        <span>{s.used} {s.unit} used</span>
                        <span className="text-black font-semibold">{s.total} {s.unit} total</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Storage Breakdown Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2"><HardDrive className="w-4 h-4"/> Storage Allocation by Project</h3>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-mono text-gray-500 border-b border-gray-200 uppercase tracking-widest">
                        <th className="py-3 pl-6">Project</th>
                        <th className="py-3">Database Size</th>
                        <th className="py-3">File Storage</th>
                        <th className="py-3">Backups</th>
                        <th className="py-3 pr-6">Last Backup</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { project: 'Karani Law / Billszip', db: '245 MB', files: '1.2 GB', backups: '12', last: '2h ago' },
                        { project: 'OdinBot Framework', db: '180 MB', files: '890 MB', backups: '8', last: '4h ago' },
                        { project: 'Matta AI Core', db: '2.1 GB', files: '4.5 GB', backups: '24', last: '30m ago' },
                        { project: 'AO Tech CI/CD', db: '95 MB', files: '340 MB', backups: '6', last: '12h ago' },
                        { project: 'Sayara Shop', db: '150 MB', files: '2.8 GB', backups: '10', last: '6h ago' },
                      ].map((s, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 pl-6 font-semibold text-black">{s.project}</td>
                          <td className="py-3 text-xs font-mono text-gray-600">{s.db}</td>
                          <td className="py-3 text-xs font-mono text-gray-600">{s.files}</td>
                          <td className="py-3 text-xs font-mono text-gray-600">{s.backups} snapshots</td>
                          <td className="py-3 pr-6 text-xs font-mono text-gray-500">{s.last}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== FEE NOTES TAB ========== */}
            {activeTab === 'boc' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Fee Notes & Billing</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">Admin overview of all fee notes generated across all client matters</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Fee Notes', value: '47', color: 'text-black' },
                    { label: 'Pending Taxation', value: '12', color: 'text-amber-600' },
                    { label: 'Total Billed', value: 'KES 34.8M', color: 'text-emerald-600' },
                    { label: 'Avg. Note Value', value: 'KES 740K', color: 'text-blue-600' },
                  ].map((s, i) => (
                    <div key={i} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
                      <h3 className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: '"Sora", sans-serif' }}>{s.value}</h3>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold mb-4">Aggregated API Rate Limit Heatmap</h3>
                  <p className="text-xs text-gray-500 mb-4">API hit density across the week — helps predict billing endpoint scaling needs</p>
                  <div className="flex flex-wrap gap-[2px]">
                    {Array.from({ length: 168 }).map((_, i) => {
                      const intensity = Math.random();
                      let bgClass = 'bg-[#ebedf0]';
                      if (intensity > 0.85) bgClass = 'bg-[#216e39]';
                      else if (intensity > 0.65) bgClass = 'bg-[#30a14e]';
                      else if (intensity > 0.4) bgClass = 'bg-[#40c463]';
                      else if (intensity > 0.2) bgClass = 'bg-[#9be9a8]';
                      return <div key={i} className={`w-[10px] h-[10px] rounded-[1px] ${bgClass}`} title={`Hour ${i}: ${Math.round(intensity * 1000)} hits`}></div>
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500 font-mono">
                    <span>Mon 00:00</span>
                    <span>→ Sun 23:59</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========== CRM CONTROL TAB ========== */}
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>CRM Control</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">Client relationship management across all P3L client accounts</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { name: 'Seyani Brothers & Co.', industry: 'Construction', projects: 2, status: 'Active', revenue: 'KES 30.8M' },
                    { name: 'Zhenjian Construction', industry: 'Construction', projects: 1, status: 'Active', revenue: 'KES 405K' },
                    { name: 'Dhanya Construction', industry: 'Construction', projects: 1, status: 'Pending', revenue: 'KES 3.9M' },
                    { name: 'AO Technologies', industry: 'Tech', projects: 3, status: 'Active', revenue: 'KES 2.1M' },
                    { name: 'Nokras Ltd', industry: 'E-Commerce', projects: 1, status: 'Active', revenue: 'KES 890K' },
                    { name: 'Sayara Aesthetics', industry: 'Beauty', projects: 1, status: 'Active', revenue: 'KES 450K' },
                  ].map((c, i) => (
                    <div key={i} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-black text-black font-mono">{c.name[0]}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>{c.status}</span>
                      </div>
                      <h4 className="text-sm font-bold text-black leading-tight mb-1">{c.name}</h4>
                      <p className="text-[10px] font-mono text-gray-500 mb-3">{c.industry} • {c.projects} project(s)</p>
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-black text-black">{c.revenue}</span>
                        <button onClick={() => handleAction(`Manage ${c.name}`)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">Manage →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== THEME & BRANDING TAB ========== */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Theme & Branding</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">Customize appearance and branding across all P3L client-facing projects</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold mb-4">Color Palette</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {['#000000', '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'].map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          <div className="w-12 h-12 rounded-xl border border-gray-200 shadow-xs cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c }}></div>
                          <span className="text-[9px] font-mono text-gray-500">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold mb-4">Typography</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-2xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>Sora — Headlines</p>
                        <p className="text-[10px] font-mono text-gray-500 mt-1">font-family: "Sora", sans-serif • Weight: 800</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-lg font-medium text-black" style={{ fontFamily: '"Inter", sans-serif' }}>Inter — Body Text</p>
                        <p className="text-[10px] font-mono text-gray-500 mt-1">font-family: "Inter", sans-serif • Weight: 400-700</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-mono text-black">Mono — Code & Data</p>
                        <p className="text-[10px] font-mono text-gray-500 mt-1">font-family: monospace • Weight: 400-600</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold mb-4">Logo Assets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center gap-3">
                      <img src="/p2l_logo.jpeg" alt="P2L Logo" className="h-16 object-contain rounded-lg" />
                      <span className="text-[10px] font-mono text-gray-500">P2L Logo (Primary)</span>
                    </div>
                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center gap-3">
                      <img src="/p3l_logo.jpeg" alt="P3L Logo" className="h-16 object-contain rounded-lg" />
                      <span className="text-[10px] font-mono text-gray-500">P3L Logo (Dev)</span>
                    </div>
                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center gap-3">
                      <img src="/logo.png" alt="Firm Logo" className="h-16 object-contain rounded-lg" />
                      <span className="text-[10px] font-mono text-gray-500">Firm Logo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== SYSTEM WIPE TAB ========== */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-black" style={{ fontFamily: '"Sora", sans-serif' }}>System Wipe & Recovery</h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">Danger zone — irreversible actions for full system reset and data recovery</p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50/30 p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-red-700 font-bold flex items-center gap-2 mb-4"><ShieldAlert className="w-4 h-4" /> Danger Zone</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Purge All Session Data', desc: 'Clear all active sessions, forcing re-authentication for every user.', level: 'medium' },
                      { action: 'Reset Fee Notes Database', desc: 'Permanently delete all fee notes and billing records. Cannot be undone.', level: 'high' },
                      { action: 'Full System Wipe', desc: 'Factory reset the entire P3L platform. All data, users, projects destroyed.', level: 'critical' },
                    ].map((d, i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-red-200 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-red-800">{d.action}</p>
                          <p className="text-[11px] text-red-600/70 mt-0.5">{d.desc}</p>
                        </div>
                        <button onClick={() => handleAction(d.action)} className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors shrink-0 ${
                          d.level === 'critical' ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' :
                          d.level === 'high' ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' :
                          'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                        }`}>
                          {d.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xs p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-black font-bold flex items-center gap-2 mb-4"><Database className="w-4 h-4" /> Recovery & Snapshots</h3>
                  <div className="space-y-3">
                    {[
                      { snapshot: 'auto-backup-2026-09-28-14:00', size: '2.4 GB', age: '3h ago' },
                      { snapshot: 'auto-backup-2026-09-28-08:00', size: '2.4 GB', age: '9h ago' },
                      { snapshot: 'manual-backup-2026-09-27', size: '2.3 GB', age: '1 day ago' },
                      { snapshot: 'auto-backup-2026-09-26-14:00', size: '2.3 GB', age: '2 days ago' },
                    ].map((snap, i) => (
                      <div key={i} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HardDriveDownload className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs font-bold text-black font-mono">{snap.snapshot}</p>
                            <p className="text-[10px] text-gray-500">{snap.size} • {snap.age}</p>
                          </div>
                        </div>
                        <button onClick={() => handleAction(`Restore ${snap.snapshot}`)} className="px-3 py-1.5 text-xs font-bold text-black border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Restore</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modern Footer */}
            <div className="mt-16 border-t border-gray-200 pt-8 pb-4 flex justify-between items-center text-gray-400 text-[10px] font-mono uppercase tracking-widest">
              <p>P2L & P3L Developers Admin Setting</p>
              <p className="text-black font-bold">Developed by Razakk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
