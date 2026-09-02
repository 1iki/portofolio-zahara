import React, { useState, useEffect } from 'react';
import { SoundProvider } from './context/SoundContext';
import CustomCursor from './components/CustomCursor';
import ScanlineOverlay from './components/ScanlineOverlay';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Timeline from './components/Timeline';
import StatsLevelMeter from './components/StatsLevelMeter';
import WorkGrid from './components/WorkGrid';
import ScriptPreviewSection from './components/ScriptPreviewSection';
import DocumentationSection from './components/DocumentationSection';
import Contact from './components/Contact';

// CMS Imports
import PinGate from './components/manage/PinGate';
import ManageLayout from './components/manage/ManageLayout';
import ManageDashboard from './pages/manage/ManageDashboard';
import ManageWorks from './pages/manage/ManageWorks';
import ManageDocumentation from './pages/manage/ManageDocumentation';
import ManageScripts from './pages/manage/ManageScripts';
import ManageExperience from './pages/manage/ManageExperience';
import ManageEducation from './pages/manage/ManageEducation';
import ManageContact from './pages/manage/ManageContact';
import ManageConfigs from './pages/manage/ManageConfigs';
import { isAuthenticated, isAuthenticatedAsync } from './lib/authService';

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [cmsTab, setCmsTab] = useState('dashboard');
  const [openNewWorkTrigger, setOpenNewWorkTrigger] = useState(0);
  const [openNewDocTrigger, setOpenNewDocTrigger] = useState(0);

  const checkServerAuth = async () => {
    const auth = await isAuthenticatedAsync();
    setIsAuth(auth);
  };

  useEffect(() => {
    checkServerAuth();
    const handlePopState = () => {
      setPathname(window.location.pathname);
      checkServerAuth();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
    checkServerAuth();
  };

  const isManageRoute = pathname.startsWith('/manage');

  if (isManageRoute) {
    if (!isAuth) {
      return (
        <PinGate
          onSuccess={() => {
            setIsAuth(true);
          }}
        />
      );
    }

    return (
      <ManageLayout
        activeTab={cmsTab}
        onNavigate={(tabId) => setCmsTab(tabId)}
        onLogout={() => {
          setIsAuth(false);
          navigateTo('/');
        }}
      >
        {cmsTab === 'dashboard' && (
          <ManageDashboard
            onNavigate={(tabId) => setCmsTab(tabId)}
            onOpenNewWork={() => {
              setCmsTab('works');
              setOpenNewWorkTrigger((prev) => prev + 1);
            }}
            onOpenNewDoc={() => {
              setCmsTab('documentation');
              setOpenNewDocTrigger((prev) => prev + 1);
            }}
          />
        )}
        {cmsTab === 'works' && (
          <ManageWorks openNewModalTrigger={openNewWorkTrigger} />
        )}
        {cmsTab === 'documentation' && (
          <ManageDocumentation openNewModalTrigger={openNewDocTrigger} />
        )}
        {cmsTab === 'scripts' && <ManageScripts />}
        {cmsTab === 'experience' && <ManageExperience />}
        {cmsTab === 'education' && <ManageEducation />}
        {cmsTab === 'contact' && <ManageContact />}
        {cmsTab === 'configs' && <ManageConfigs />}
      </ManageLayout>
    );
  }

  // Public Website View
  return (
    <SoundProvider>
      <div className="min-h-screen bg-navy-base font-body text-ivory">
        <CustomCursor />
        <ScanlineOverlay />
        
        <Navbar />
        
        <main>
          <Hero />
          <About />
          <Timeline />
          <StatsLevelMeter />
          <WorkGrid />
          <ScriptPreviewSection />
          <DocumentationSection />
        </main>
        
        <Contact />
      </div>
    </SoundProvider>
  );
}
