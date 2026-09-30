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
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManagingPartnerGodMode } from './components/admin/ManagingPartnerGodMode';
import { ManagingPartnerHubView } from './components/admin/ManagingPartnerHubView';
import { ApprovalQueueView } from './components/admin/ApprovalQueueView';
import { RevenueAnalyticsView } from './components/admin/RevenueAnalyticsView';
import { AdvocatePermissionsView } from './components/admin/AdvocatePermissionsView';
import { LiveActivityFeedView } from './components/admin/LiveActivityFeedView';

import { SystemUser, SEEDED_USERS } from './services/supabase';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    const savedSession = localStorage.getItem('BILLSZIP_SESSION');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {}
    }
    const defaultUser = SEEDED_USERS[1]; // Adv. Nyagah Kithinji
    try {
      localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(defaultUser));
    } catch (e) {}
    return defaultUser;
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [previousTab, setPreviousTab] = useState<string>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showRecentsDrawer, setShowRecentsDrawer] = useState<boolean>(false);

  const [builderNote, setBuilderNote] = useState<any>(null);
  const [builderPreview, setBuilderPreview] = useState<boolean>(false);

  useEffect(() => {
    // Check Session
    const savedSession = localStorage.getItem('BILLSZIP_SESSION');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        setCurrentUser(SEEDED_USERS[1]);
      }
    } else {
      setCurrentUser(SEEDED_USERS[1]);
    }

    // Force Light Theme
    setIsDarkMode(false);
    document.body.classList.remove('dark-mode');
    document.documentElement.classList.remove('dark');
    localStorage.setItem('BILLSZIP_THEME', 'light');

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        const saved = localStorage.getItem('BILLSZIP_SESSION');
        if (saved) {
          try { setCurrentUser(JSON.parse(saved)); } catch(e) {}
        }
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
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

  const handleNavigateToBuilder = (note?: any, isPreview?: boolean) => {
    setBuilderNote(note || null);
    setBuilderPreview(isPreview || false);
    handleNavigateTab('boc');
  };

  // If accessing the standalone Developer Page (now Admin Dashboard)
  if (window.location.pathname === '/developer-page' || window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

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
    <div className="h-screen flex bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 font-sans relative overflow-hidden">
      
      {/* Sidebar: Full Height on Left */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area: Stacking Navbar and Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
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

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 w-full space-y-6">
          {/* Universal Back Button & Breadcrumb Navigation Bar (All Pages Except Home) */}
          <BreadcrumbsNav
            currentTab={currentTab}
            onNavigateTab={handleNavigateTab}
            previousTab={previousTab}
          />

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
              initialNote={builderNote}
              isPreview={builderPreview}
              onNavigateToTab={handleNavigateTab}
              currentUser={currentUser}
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

          {/* MANAGING PARTNER SUITE PAGES */}
          {currentTab === 'managing_hub' && <ManagingPartnerHubView onNavigateTab={handleNavigateTab} />}
          {currentTab === 'managing_approvals' && (
            <ApprovalQueueView
              onNavigateToBuilder={handleNavigateToBuilder}
              onNavigateTab={handleNavigateTab}
            />
          )}
          {currentTab === 'managing_revenue' && <RevenueAnalyticsView />}
          {currentTab === 'managing_permissions' && <AdvocatePermissionsView />}
          {currentTab === 'managing_audit' && <LiveActivityFeedView />}

          {/* MASTER DEVELOPER CONSOLE */}
          {currentTab === 'admin' && (
            <ManagingPartnerGodMode
              onNavigateToBuilder={handleNavigateToBuilder}
              onNavigateTab={handleNavigateTab}
            />
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
