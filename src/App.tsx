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
import { PasswordResetView } from './components/auth/PasswordResetView';
import { RecentsDraftsDrawer } from './components/layout/RecentsDraftsDrawer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManagingPartnerGodMode } from './components/admin/ManagingPartnerGodMode';
import { ManagingPartnerHubView } from './components/admin/ManagingPartnerHubView';
import { ApprovalQueueView } from './components/admin/ApprovalQueueView';
import { RevenueAnalyticsView } from './components/admin/RevenueAnalyticsView';
import { AdvocatePermissionsView } from './components/admin/AdvocatePermissionsView';
import { LiveActivityFeedView } from './components/admin/LiveActivityFeedView';
import { ToastContainer } from './components/admin/ToastNotification';
import { AccessDeniedView } from './components/common/AccessDeniedView';

import { SystemUser } from './services/supabase';
import { getCurrentUserProfile, signOut, subscribeToAuthState } from './services/auth';
import { subscribeToFirmTable } from './services/realtime';
import { hasPermission } from './services/rbac';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    try {
      const stored = localStorage.getItem('BILLSZIP_SESSION');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return null;
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [previousTab, setPreviousTab] = useState<string>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('BILLSZIP_THEME') || localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showRecentsDrawer, setShowRecentsDrawer] = useState<boolean>(false);
  const [, setPermissionTick] = useState(0);

  const can = (code: string) => hasPermission(currentUser, code);

  const [builderNote, setBuilderNote] = useState<any>(null);
  const [builderPreview, setBuilderPreview] = useState<boolean>(false);

  useEffect(() => {
    // Apply saved theme class to html & body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode', 'dark');
    }

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
      }
    };

    const handlePermissions = () => {
      setPermissionTick(t => t + 1);
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('permissionsUpdated', handlePermissions);
    window.addEventListener('storage', handlePermissions);

    let isMounted = true;
    void getCurrentUserProfile().then(profile => {
      if (isMounted && profile) {
        localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(profile));
        setCurrentUser(profile);
      }
    }).catch(() => {});

    const unsubscribeAuth = subscribeToAuthState((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('BILLSZIP_SESSION');
        setCurrentUser(null);
        return;
      }
      if (session) {
        void getCurrentUserProfile().then(profile => {
          if (isMounted && profile) {
            localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(profile));
            setCurrentUser(profile);
          }
        }).catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('permissionsUpdated', handlePermissions);
      window.removeEventListener('storage', handlePermissions);
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.firmId) return;

    const tables = ['clients', 'matters', 'fee_notes', 'documents', 'messages', 'notifications', 'activity_logs'] as const;
    const cleanups = tables.map(table => subscribeToFirmTable(currentUser.firmId!, table, change => {
      window.dispatchEvent(new CustomEvent('databaseRealtimeUpdate', {
        detail: { table, ...change },
      }));
    }));

    return () => cleanups.forEach(cleanup => cleanup());
  }, [currentUser?.firmId]);

  const [selectedPermissionUserId, setSelectedPermissionUserId] = useState<string>('');

  const handleNavigateTab = (newTab: string, targetUserId?: string) => {
    if (targetUserId) {
      setSelectedPermissionUserId(targetUserId);
    }
    if (newTab === 'boc') {
      // Clear any previous note when opening blank BOC Builder from navigation
      setBuilderNote(null);
      setBuilderPreview(false);
    }
    if (newTab !== currentTab) {
      setPreviousTab(currentTab);
      setCurrentTab(newTab);
    }
  };

  const handleLogout = () => {
    void signOut().catch(() => {});
    localStorage.removeItem('BILLSZIP_SESSION');
    setCurrentUser(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode', 'dark');
        localStorage.setItem('BILLSZIP_THEME', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-mode', 'dark');
        localStorage.setItem('BILLSZIP_THEME', 'light');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleNavigateToBuilder = (note?: any, isPreview?: boolean) => {
    setBuilderNote(note || null);
    setBuilderPreview(isPreview || false);
    if (currentTab !== 'boc') {
      setPreviousTab(currentTab);
      setCurrentTab('boc');
    }
  };

  // If user is not logged in, render Login View
  if (window.location.hash.includes('type=recovery')) {
    return <PasswordResetView />;
  }

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

  // Standalone admin URLs still require a real authenticated privileged profile.
  if (window.location.pathname === '/developer-page' || window.location.pathname === '/admin') {
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Developer') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] p-6">
          <div className="vercel-card max-w-md p-8 text-center space-y-4">
            <ShieldAlert className="w-10 h-10 mx-auto text-amber-500" />
            <h1 className="font-brand font-bold text-xl">Access denied</h1>
            <p className="text-sm text-[var(--text-muted)]">Your account does not have platform administration access.</p>
          </div>
        </div>
      );
    }
    return <AdminDashboard />;
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
            can('dashboard.view') ? (
              <DashboardView
                onNavigateTab={handleNavigateTab}
                onNavigateToBuilder={handleNavigateToBuilder}
                onOpenRecents={() => setShowRecentsDrawer(true)}
                currentUser={currentUser}
              />
            ) : (
              <AccessDeniedView
                resourceName="Advocate Dashboard"
                permissionCode="dashboard.view"
                onNavigateHome={() => handleNavigateTab('support')}
              />
            )
          )}

          {currentTab === 'boc' && (
            can('boc.view') ? (
              <FeeNoteBuilderView
                initialNote={builderNote}
                isPreview={builderPreview}
                onNavigateToTab={handleNavigateTab}
                currentUser={currentUser}
              />
            ) : (
              <AccessDeniedView
                resourceName="Bill of Costs Builder"
                permissionCode="boc.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'feenotes' && (
            can('feenotes.view') ? (
              <FeeNotesListView
                onNavigateTab={handleNavigateTab}
                onNavigateToBuilder={handleNavigateToBuilder}
                currentUser={currentUser}
              />
            ) : (
              <AccessDeniedView
                resourceName="Fee Notes Ledger"
                permissionCode="feenotes.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'matters' && (
            can('matters.view') ? (
              <MattersView onNavigateTab={handleNavigateTab} currentUser={currentUser} />
            ) : (
              <AccessDeniedView
                resourceName="My Matters Registry"
                permissionCode="matters.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'clients' && (
            can('clients.view') ? (
              <ClientsView currentUser={currentUser} />
            ) : (
              <AccessDeniedView
                resourceName="Clients Directory"
                permissionCode="clients.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'messages' && <MessagesView currentUser={currentUser} />}

          {currentTab === 'vault' && (
            can('vault.view') ? (
              <DocumentVaultView currentUser={currentUser} />
            ) : (
              <AccessDeniedView
                resourceName="Document Vault"
                permissionCode="vault.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'guide' && (
            can('guide.view') ? (
              <RemunerationGuideView />
            ) : (
              <AccessDeniedView
                resourceName="Remuneration Guide"
                permissionCode="guide.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'company' && <CompanyProfileView currentUser={currentUser} />}

          {currentTab === 'profile' && (
            <ProfileSettingsView 
              currentUser={currentUser} 
              isDarkMode={isDarkMode} 
              toggleTheme={toggleTheme} 
              initialTab="profile" 
            />
          )}

          {currentTab === 'settings' && (
            can('settings.view') ? (
              <ProfileSettingsView 
                currentUser={currentUser} 
                isDarkMode={isDarkMode} 
                toggleTheme={toggleTheme} 
                initialTab="firm" 
              />
            ) : (
              <AccessDeniedView
                resourceName="Firm Settings"
                permissionCode="settings.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'support' && (
            can('support.view') ? (
              <TechSupportView currentUser={currentUser} />
            ) : (
              <AccessDeniedView
                resourceName="Support & Help"
                permissionCode="support.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {/* MANAGING PARTNER SUITE PAGES */}
          {currentTab === 'managing_hub' && (
            can('managing_hub.view') ? (
              <ManagingPartnerHubView 
                onNavigateTab={handleNavigateTab} 
                onNavigateToBuilder={handleNavigateToBuilder}
                currentUser={currentUser} 
              />
            ) : (
              <AccessDeniedView
                resourceName="Executive Hub"
                permissionCode="managing_hub.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'managing_approvals' && (
            can('feenotes.approve') ? (
              <ApprovalQueueView
                onNavigateToBuilder={handleNavigateToBuilder}
                onNavigateTab={handleNavigateTab}
                currentUser={currentUser}
              />
            ) : (
              <AccessDeniedView
                resourceName="Fee Note Approvals Queue"
                permissionCode="feenotes.approve"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'managing_revenue' && (
            can('managing_hub.financial_summary') ? (
              <RevenueAnalyticsView currentUser={currentUser} />
            ) : (
              <AccessDeniedView
                resourceName="Revenue Analytics"
                permissionCode="managing_hub.financial_summary"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {(currentTab === 'managing_permissions' || currentTab === 'permissions') && (
            can('permissions.view') ? (
              <AdvocatePermissionsView currentUser={currentUser} initialUserId={selectedPermissionUserId} />
            ) : (
              <AccessDeniedView
                resourceName="Advocate Permissions & Role Templates"
                permissionCode="permissions.view"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {currentTab === 'managing_audit' && (
            can('managing_hub.activity_logs') ? (
              <LiveActivityFeedView />
            ) : (
              <AccessDeniedView
                resourceName="Firm Activity Audit Log"
                permissionCode="managing_hub.activity_logs"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
          )}

          {/* MASTER DEVELOPER CONSOLE */}
          {currentTab === 'admin' && (
            (currentUser?.role === 'Admin' || currentUser?.role === 'Developer' || can('permissions.manage_roles')) ? (
              <ManagingPartnerGodMode
                onNavigateToBuilder={handleNavigateToBuilder}
                onNavigateTab={handleNavigateTab}
              />
            ) : (
              <AccessDeniedView
                resourceName="Platform Administration"
                permissionCode="permissions.manage_roles"
                onNavigateHome={() => handleNavigateTab('home')}
              />
            )
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
      <ToastContainer />
    </div>
  );
};

export default App;
