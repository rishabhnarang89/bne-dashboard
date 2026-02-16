import { useState } from 'react';
import { Sidebar, MobileHeader } from './components/Sidebar';
import type { Tab } from './components/Sidebar';
import { Tasks } from './components/views/Tasks';
import { Interviews } from './components/views/Interviews';
import { BuildGuide } from './components/views/BuildGuide';
import { Decision } from './components/views/Decision';
import { Analytics } from './components/views/Analytics';
import { Settings } from './components/views/Settings';
import { Demo } from './components/views/Demo';
import { LoginScreen } from './components/views/LoginScreen';
import { Report } from './components/views/Report';
import { ToastProvider } from './components/ui';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { KnowledgeHub } from './components/views/KnowledgeHub';

const TAB_CONFIG: Record<Tab, { title: string; subtitle: string }> = {
  timeline: { title: 'Task Hub', subtitle: 'Manage tasks, assignments, and priorities.' },
  interviews: { title: 'Teacher Interview Tracker', subtitle: 'Log feedback, capture insights, and calculate adoption scores.' },
  build: { title: 'Hardware & Software Guide', subtitle: 'Step-by-step instructions to build the MVP.' },
  decision: { title: 'Go/No-Go Decision Framework', subtitle: 'Live view of your validation criteria and recommendation.' },
  analytics: { title: 'Analytics Dashboard', subtitle: 'Visualize your interview data with charts and trends.' },
  demo: { title: 'Interactive Product Demo', subtitle: 'Share the BNE Kit vision with teachers during interviews.' },
  report: { title: 'Stakeholder Report', subtitle: 'Printable executive summary for advisors and partners.' },
  knowledge: { title: 'Knowledge Hub', subtitle: 'Central repository for project resources, links, and files.' },
  settings: { title: 'Settings', subtitle: 'Customize goals, appearance, and manage your data.' }
};

import { ActivityFeed } from './components/ActivityFeed';

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'timeline': return <Tasks />;
      case 'interviews': return <Interviews />;
      case 'build': return <BuildGuide />;
      case 'decision': return <Decision />;
      case 'analytics': return <Analytics />;
      case 'demo': return <Demo />;
      case 'report': return <Report />;
      case 'knowledge': return <KnowledgeHub />;
      case 'settings': return <Settings />;
      default: return <Tasks />;
    }
  };

  const tabConfig = TAB_CONFIG[activeTab];

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleActivity={() => setActivityOpen(true)}
      />

      <ActivityFeed
        isOpen={activityOpen}
        onClose={() => setActivityOpen(false)}
      />

      <main className="main-content">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        <header style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '6px', fontSize: '1.75rem' }}>{tabConfig.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{tabConfig.subtitle}</p>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

const AppGate = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <DashboardContent />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppGate />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
