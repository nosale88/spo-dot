import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import GlobalAnnouncementBanner from '../components/layout/GlobalAnnouncementBanner';
import AnnouncementDisplay from '../components/common/Announcement'; 
import { useAuth } from '../contexts/AuthContext';
import { useAnnouncement } from '../contexts/AnnouncementContext';
import type { Announcement as GlobalAnnouncement } from '../types'; 

interface DisplayAnnouncement {
  id: string;
  message: string;
  createdAt: string;
  createdBy: string; 
  createdByName: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high';
  link?: string;
}

const MainLayout = () => {
  const { user } = useAuth();
  const { announcements: globalAnnouncements, loading: announcementsLoading, error: announcementsError } = useAnnouncement(); 
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const [dismissedInSessionIds, setDismissedInSessionIds] = useState<string[]>([]);

  const handleDismissInSession = (id: string) => {
    setDismissedInSessionIds(prev => [...prev, id]);
  };

  let announcementsToFilter: GlobalAnnouncement[] = [];
  if (Array.isArray(globalAnnouncements)) {
    announcementsToFilter = globalAnnouncements;
  } else if (globalAnnouncements) {
    console.warn('MainLayout: globalAnnouncements from context is not an array. Received:', globalAnnouncements);
  }

  const displayableAnnouncements: DisplayAnnouncement[] = announcementsToFilter
    .filter(ann => ann.isPublished && !dismissedInSessionIds.includes(ann.id))
    .map((ann: GlobalAnnouncement): DisplayAnnouncement => ({
      id: ann.id,
      message: `${ann.title}${ann.content ? `: ${ann.content}` : ''}`,
      createdAt: ann.createdAt,
      createdBy: ann.authorId || 'system',
      createdByName: ann.authorId ? `User ${ann.authorId.substring(0,6)}` : '시스템',
      priority: 'medium', 
      expiresAt: undefined, 
      link: undefined,      
    }));

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? savedState === 'true' : window.innerWidth >= 1024;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <GlobalAnnouncementBanner />
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* 기존 공지사항 표시 로직은 유지하거나, 새 배너와 통합/제거를 고려할 수 있습니다. */}
        {/* 여기서는 일단 유지합니다. */}
        {!announcementsLoading && !announcementsError && displayableAnnouncements.length > 0 && (
          <AnnouncementDisplay 
            announcements={displayableAnnouncements} 
            onDismiss={handleDismissInSession} 
          />
        )}
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-screen-2xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;