import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

type HeaderProps = {
  toggleSidebar: () => void;
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 다크모드 토글
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 알림 데이터 (예시)
  const notifications = [
    { id: 1, message: '김철수 트레이너가 일정을 변경했습니다.', time: '10분 전' },
    { id: 2, message: '새로운 고객이 등록했습니다: 박지민', time: '1시간 전' },
    { id: 3, message: '오늘 예정된 PT 세션이 3개 있습니다.', time: '3시간 전' },
  ];

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white ml-2 hidden sm:block">
          피트니스 센터 관리
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* 다크모드 토글 */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* 알림 */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showUserMenu) setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              {notifications.length}
            </span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 border border-slate-200 dark:border-slate-700 z-30"
              >
                <h3 className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                  알림
                </h3>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-0"
                    >
                      <p className="text-sm text-slate-800 dark:text-slate-100">{notification.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center border-t border-slate-200 dark:border-slate-700">
                  <button className="text-sm text-primary hover:text-primary-dark transition-colors">
                    모든 알림 보기
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 사용자 프로필 */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              if (showNotifications) setShowNotifications(false);
            }}
            className="flex items-center"
          >
            <img 
              src={user?.profileImage || "https://via.placeholder.com/40"} 
              alt={user?.name} 
              className="h-8 w-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />
            <span className="ml-2 text-sm font-medium text-slate-900 dark:text-white hidden md:block">
              {user?.name}
            </span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 border border-slate-200 dark:border-slate-700 z-30"
              >
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
                >
                  <User size={16} className="mr-2" />
                  내 프로필
                </button>
                <button 
                  onClick={() => {
                    // 로그아웃 로직
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  로그아웃
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;