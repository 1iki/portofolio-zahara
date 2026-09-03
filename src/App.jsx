import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import SplashLoader from './components/SplashLoader';
import PercentLoader from './components/common/PercentLoader';

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
  const [showSplash, setShowSplash] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);

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
    setIsNavigating(true);
    setNavProgress(25);
    const timer1 = setTimeout(() => setNavProgress(70), 100);
    const timer2 = setTimeout(() => {
      setNavProgress(100);
      window.history.pushState({}, '', path);
      setPathname(path);
      checkServerAuth();
      setTimeout(() => setIsNavigating(false), 200);
    }, 250);
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
        onNavigate={(tabId) => {
          setIsNavigating(true);
          setNavProgress(30);
          setTimeout(() => setNavProgress(80), 80);
          setTimeout(() => {
            setCmsTab(tabId);
            setNavProgress(100);
            setTimeout(() => setIsNavigating(false), 150);
          }, 200);
        }}
        onLogout={() => {
          setIsAuth(false);
          navigateTo('/');
        }}
      >
        {/* Compact Route Navigation Loader */}
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-slate-900/90 text-white backdrop-blur-sm border-b border-slate-700 shadow-md">
            <PercentLoader
              variant="percent"
              label="Percent"
              value={navProgress}
              subtext="Loading route..."
              size="inline"
              showBar={true}
            />
          </div>
        )}

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
      {/* Initial App Boot Splash Loader */}
      {showSplash && (
        <SplashLoader
          onComplete={() => setShowSplash(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 8 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen bg-navy-base font-body text-ivory relative"
      >
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
      </motion.div>
    </SoundProvider>
  );
}
