import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from '../common/NotificationCenter';
import InitialsAvatar from '../common/InitialsAvatar';

type HeaderProps = {
  toggleSidebar: () => void;
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showUserMenu]);

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

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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

        {/* 알림 센터 */}
        <NotificationCenter />

        {/* 사용자 프로필 */}
        <div className="relative">
          <button 
            ref={buttonRef}
            onClick={toggleUserMenu}
            className="flex items-center"
          >
            <InitialsAvatar 
              name={user?.name || '사용자'} 
              size="sm"
              className="border-2 border-slate-200 dark:border-slate-700"
            />
            <span className="ml-2 text-sm font-medium text-slate-900 dark:text-white hidden md:block">
              {user?.name}
            </span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                ref={userMenuRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 border border-slate-200 dark:border-slate-700 z-30"
                onClick={(e) => e.stopPropagation()} // 메뉴 내부 클릭 시 버블링 방지
              >
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                  <InitialsAvatar name={user?.name || '사용자'} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'admin' ? '관리자' : user?.role === 'trainer' ? '트레이너' : '직원'}</p>
                  </div>
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