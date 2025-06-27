import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from '@/components/common/NotificationCenter';
import InitialsAvatar from '@/components/common/InitialsAvatar';
import { RealtimeStatusBar, RealtimeDebugPanel } from '@/components/common/RealtimeStatus';
import { rolePermissions } from '../../types/permissions';
import Icon from '../common/Icon';

type HeaderProps = {
  toggleSidebar: () => void;
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notificationCount, setNotificationCount] = useState(3);

  // 개발 환경에서 권한 디버그 정보 표시
  const showDebugInfo = process.env.NODE_ENV === 'development';

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

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setShowUserMenu(!showUserMenu);
  };

  // 모바일 메뉴 버튼 클릭 처리 함수
  const handleMenuButtonClick = () => {
    console.log('메뉴 버튼 클릭');
    toggleSidebar();
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 z-10">
      <div className="flex items-center">
        <button 
          onClick={handleMenuButtonClick}
          aria-label="Toggle menu"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 touch-manipulation"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-900 ml-2 hidden lg:block">
          피트니스 센터 관리
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* 🐛 디버그 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border">
            <div>사용자: {user?.name}</div>
            <div>역할: {user?.role}</div>
            <div>ID: {user?.id}</div>
            <div>권한수: {user?.permissions?.length || 0}</div>
            <div>저장된ID: {localStorage.getItem('currentUserId')}</div>
          </div>
        )}
        
        {/* 실시간 상태 표시 */}
        <RealtimeStatusBar />
        
        {/* 알림 아이콘 */}
        <button 
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          title="알림"
        >
                      <Icon name="Bell" size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

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
              className="border-2 border-slate-200"
            />
            <span className="ml-2 text-sm font-medium text-slate-900 hidden md:block">
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
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-slate-200 z-30"
                onClick={(e) => e.stopPropagation()} // 메뉴 내부 클릭 시 버블링 방지
              >
                <div className="px-4 py-2 border-b border-slate-200 flex items-center space-x-3">
                  <InitialsAvatar name={user?.name || '사용자'} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">
                      {user?.role === 'admin' ? '관리자' : 
                       user?.role === 'reception' ? '리셉션' :
                       user?.role === 'fitness' ? '피트니스' :
                       user?.role === 'tennis' ? '테니스' :
                       user?.role === 'golf' ? '골프' : '직원'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
                >
                  <User size={16} className="mr-2" />
                  내 프로필
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  로그아웃
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* 개발자용 실시간 디버그 패널 */}
      <RealtimeDebugPanel />
    </header>
  );
};

export default Header;