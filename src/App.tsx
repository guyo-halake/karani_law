import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BreadcrumbsNav } from './components/layout/BreadcrumbsNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { FeeNoteBuilderView } from './components/feenotes/FeeNoteBuilderView';
import { FeeNotesListView } from './components/feenotes/FeeNotesListView';
import { MattersView } from './components/matters/MattersView';
import { ClientsView } from './components/clients/ClientsView';
import { MessagesView } from './components/messages/MessagesView';
import { DocumentVaultView } from './components/vault/DocumentVaultView';
import { RemunerationGuideView } from './components/guide/RemunerationGuideView';
import { CompanyProfileView } from './components/profile/CompanyProfileView';
import { MyProfileView } from './components/profile/MyProfileView';
import { ProfileSettingsView } from './components/settings/ProfileSettingsView';
import { TechSupportView } from './components/support/TechSupportView';
import { LoginView } from './components/auth/LoginView';
import { RecentsDraftsDrawer } from './components/layout/RecentsDraftsDrawer';

// Import 11 Packed Admin Settings Views
import AdminBocSettingsView from './components/admin/AdminBocSettingsView';
import AdminFirmsView from './components/admin/AdminFirmsView';
import AdminDocumentsPolicyView from './components/admin/AdminDocumentsPolicyView';
import AdminSupportSettingsView from './components/admin/AdminSupportSettingsView';
import AdminPythonEngineView from './components/admin/AdminPythonEngineView';
import AdminPermissionsView from './components/admin/AdminPermissionsView';
import AdminUsersRolesView from './components/admin/AdminUsersRolesView';
import AdminNotificationsDispatchView from './components/admin/AdminNotificationsDispatchView';
import AdminTicketingView from './components/admin/AdminTicketingView';
import AdminDatabaseHealthView from './components/admin/AdminDatabaseHealthView';
import AdminServerControlView from './components/admin/AdminServerControlView';

import { SystemUser } from './services/supabase';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [previousTab, setPreviousTab] = useState<string>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showRecentsDrawer, setShowRecentsDrawer] = useState<boolean>(false);

  const [builderCourt, setBuilderCourt] = useState('schedule_6_high_court');
  const [builderValue, setBuilderValue] = useState(0);

  useEffect(() => {
    // Check Session
    const savedSession = localStorage.getItem('BILLSZIP_SESSION');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null); // Show login view if no active session
    }

    const savedTheme = localStorage.getItem('BILLSZIP_THEME') || 'light';
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigateTab = (newTab: string) => {
    if (newTab !== currentTab) {
      setPreviousTab(currentTab);
      setCurrentTab(newTab);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('BILLSZIP_SESSION');
    setCurrentUser(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('BILLSZIP_THEME', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('BILLSZIP_THEME', 'light');
      }
      return next;
    });
  };

  const handleNavigateToBuilder = (court: string, value: number) => {
    setBuilderCourt(court);
    setBuilderValue(value);
    handleNavigateTab('boc');
  };

  // If user is not logged in, render Login View
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 font-sans relative">
      {/* Top Bar Header */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onNavigateTab={handleNavigateTab}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={handleNavigateTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 w-full space-y-6">
          {/* Universal Back Button & Breadcrumb Navigation Bar (All Pages Except Home) */}
          <BreadcrumbsNav
            currentTab={currentTab}
            onNavigateTab={handleNavigateTab}
            previousTab={previousTab}
          />

          {/* ACCESS DENIED GUARD FOR NON-DEVELOPERS ATTEMPTING ADMIN TABS */}
          {currentTab.startsWith('admin_') && currentUser?.role !== 'Developer' && currentUser?.role !== 'Admin' ? (
            <div className="w-full max-w-xl mx-auto my-12 p-8 border border-red-500/30 rounded-2xl bg-red-500/5 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  DEVELOPER ROLE REQUIRED
                </span>
                <h2 className="font-brand font-bold text-xl text-[var(--text-main)] mt-2">
                  Access Restricted to Lead Developer
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  The Admin Control Panel and System Infrastructure Settings are strictly reserved for system developers (<span className="font-mono font-bold text-[var(--text-main)]">Role: Developer</span>). Firm Admins and Advocates do not have access to these controls.
                </p>
              </div>
              <button
                onClick={() => handleNavigateTab('home')}
                className="btn-black px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Home Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* BASIC NAVIGATION VIEWS */}
              {currentTab === 'home' && (
                <DashboardView
                  onNavigateTab={handleNavigateTab}
                  onNavigateToBuilder={handleNavigateToBuilder}
                  onOpenRecents={() => setShowRecentsDrawer(true)}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'boc' && (
                <FeeNoteBuilderView
                  initialCourt={builderCourt}
                  initialValue={builderValue}
                  onNavigateToTab={handleNavigateTab}
                />
              )}

              {currentTab === 'feenotes' && (
                <FeeNotesListView
                  onNavigateTab={handleNavigateTab}
                  onNavigateToBuilder={handleNavigateToBuilder}
                />
              )}

              {currentTab === 'matters' && <MattersView onNavigateTab={handleNavigateTab} />}

              {currentTab === 'clients' && <ClientsView />}

              {currentTab === 'messages' && <MessagesView />}

              {currentTab === 'vault' && <DocumentVaultView />}

              {currentTab === 'guide' && <RemunerationGuideView />}

              {currentTab === 'company' && <CompanyProfileView />}

              {currentTab === 'profile' && <MyProfileView currentUser={currentUser} />}

              {currentTab === 'settings' && (
                <ProfileSettingsView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              )}

              {currentTab === 'support' && <TechSupportView />}

              {/* 11 PACKED ADMIN CONTROL PANEL VIEWS (DEVELOPER ROLE ONLY) */}
              {currentTab === 'admin_boc' && <AdminBocSettingsView />}
              {currentTab === 'admin_firms' && <AdminFirmsView />}
              {currentTab === 'admin_documents' && <AdminDocumentsPolicyView />}
              {currentTab === 'admin_support' && <AdminSupportSettingsView />}
              {currentTab === 'admin_python' && <AdminPythonEngineView />}
              {currentTab === 'admin_permissions' && <AdminPermissionsView />}
              {currentTab === 'admin_users' && <AdminUsersRolesView />}
              {currentTab === 'admin_notifications' && <AdminNotificationsDispatchView />}
              {currentTab === 'admin_ticketing' && <AdminTicketingView />}
              {currentTab === 'admin_database' && <AdminDatabaseHealthView />}
              {currentTab === 'admin_server' && <AdminServerControlView />}
            </>
          )}
        </main>
      </div>

      {/* Recents & Drafts Right Sidebar Drawer */}
      <RecentsDraftsDrawer
        isOpen={showRecentsDrawer}
        onClose={() => setShowRecentsDrawer(false)}
        onNavigateTab={handleNavigateTab}
        onNavigateToBuilder={handleNavigateToBuilder}
        currentUser={currentUser}
      />
    </div>
  );
};

export default App;
