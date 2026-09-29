import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Topbar } from './components/layout/Topbar.tsx';
import { LandingPage } from './components/layout/LandingPage.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { ContentLibraryView } from './components/content/ContentLibraryView.tsx';
import { ImportContentView } from './components/content/ImportContentView.tsx';
import { PerformanceView } from './components/content/PerformanceView.tsx';
import { StrategistView } from './components/intelligence/StrategistView.tsx';
import { ContentGapsView } from './components/intelligence/ContentGapsView.tsx';
import { TopicIntelligenceView } from './components/intelligence/TopicIntelligenceView.tsx';
import { BrandVoiceView } from './components/intelligence/BrandVoiceView.tsx';
import { MemoryOverviewView } from './components/memory/MemoryOverviewView.tsx';
import { MemoryRecallTester } from './components/memory/MemoryRecallTester.tsx';
import { MemoryActivityTimeline } from './components/memory/MemoryActivityTimeline.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { AddContentModal } from './components/content/AddContentModal.tsx';
import { SearchModal } from './components/common/SearchModal.tsx';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, toast } = useApp();

  if (currentView === 'landing') {
    return <LandingPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'content_library':
        return <ContentLibraryView />;
      case 'import_content':
        return <ImportContentView />;
      case 'performance':
        return <PerformanceView />;
      case 'strategist':
        return <StrategistView />;
      case 'content_gaps':
        return <ContentGapsView />;
      case 'topic_intelligence':
        return <TopicIntelligenceView />;
      case 'brand_voice':
        return <BrandVoiceView />;
      case 'memory_overview':
        return <MemoryOverviewView />;
      case 'retrieved_memories':
        return <MemoryRecallTester />;
      case 'memory_activity':
        return <MemoryActivityTimeline />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      <AddContentModal />
      <SearchModal />

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-red-950 text-red-200 border-red-800'
                : 'bg-neutral-900 text-neutral-200 border-neutral-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : (
              <Info className="h-4 w-4 text-blue-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
