import React, { useState, Suspense, lazy } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { NotificationProvider } from './context/NotificationContext';
import { IntroPage } from './pages/IntroPage';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { HomePage } from './pages/HomePage';

// Route chunks (Next.js style dynamic code-splitting)
const SwapPage = lazy(() => import('./pages/SwapPage').then(m => ({ default: m.SwapPage })));
const ReferralPage = lazy(() => import('./pages/ReferralPage').then(m => ({ default: m.ReferralPage })));
const RewardsStatusPage = lazy(() => import('./pages/RewardsStatusPage').then(m => ({ default: m.RewardsStatusPage })));
const AdminPanel = lazy(() => import('./components/Admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const ProfileModal = lazy(() => import('./components/Modals/ProfileModal').then(m => ({ default: m.ProfileModal })));
const GuideModal = lazy(() => import('./components/Modals/GuideModal').then(m => ({ default: m.GuideModal })));
const VideoModal = lazy(() => import('./components/Modals/VideoModal').then(m => ({ default: m.VideoModal })));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const AppContent: React.FC = () => {
  const { account, isCorrectNetwork } = useWeb3();
  const [activeTab, setActiveTab] = useState('home');
  const [profileOpen, setProfileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(() => {
    return (
      window.location.pathname.startsWith('/admin') ||
      new URLSearchParams(window.location.search).has('admin') ||
      window.location.hash === '#admin'
    );
  });

  React.useEffect(() => {
    const handleUrlChange = () => {
      const isAdminUrl =
        window.location.pathname.startsWith('/admin') ||
        new URLSearchParams(window.location.search).has('admin') ||
        window.location.hash === '#admin';
      if (isAdminUrl) {
        setAdminOpen(true);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    setAdminOpen(true);
    if (!window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/admin');
    }
  };

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin' || window.location.search.includes('admin')) {
      window.history.pushState(null, '', '/');
    }
  };

  // ── Admin Panel Overlay (can open even before wallet is connected) ──
  if (adminOpen) {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminPanel onClose={handleCloseAdmin} />
      </Suspense>
    );
  }

  // ── Wallet Gate: Show IntroPage if not connected or wrong network ──
  if (!account || !isCorrectNetwork) {
    return <IntroPage />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#060D19] text-[#E3E2E8]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          {activeTab === 'home' && (
            <HomePage
              onJoinNow={() => setActiveTab('swap')}
              onOpenGuide={() => setGuideOpen(true)}
              onOpenVideo={() => setVideoOpen(true)}
            />
          )}
          {activeTab === 'swap' && <SwapPage />}
          {activeTab === 'referral' && <ReferralPage />}
          {activeTab === 'rewards' && <RewardsStatusPage />}
        </Suspense>
      </main>

      {/* Bottom Footer */}
      <Footer
        onNavClick={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Overlays */}
      <Suspense fallback={null}>
        {profileOpen && (
          <ProfileModal
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        )}

        {guideOpen && (
          <GuideModal
            isOpen={guideOpen}
            onClose={() => setGuideOpen(false)}
            onGetStarted={() => {
              setActiveTab('swap');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {videoOpen && (
          <VideoModal
            isOpen={videoOpen}
            onClose={() => setVideoOpen(false)}
          />
        )}

        {adminOpen && (
          <AdminPanel onClose={() => setAdminOpen(false)} />
        )}
      </Suspense>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </NotificationProvider>
  );
};

export default App;
