import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Dumbbell, LayoutDashboard, Calendar, Users, ClipboardCheck, BarChart2, Settings, X } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 사이드바 링크
  const links = [
    { name: '대시보드', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: '일정 관리', path: '/schedule', icon: <Calendar size={22} /> },
    { name: '고객 관리', path: '/clients', icon: <Users size={22} /> },
    { name: '트레이너', path: '/trainers', icon: <Users size={22} /> },
    { name: '업무 관리', path: '/tasks', icon: <ClipboardCheck size={22} /> },
    { name: '보고서', path: '/reports', icon: <BarChart2 size={22} /> },
    { name: '관리자 설정', path: '/admin/settings', icon: <Settings size={22} />, roles: ['admin'] },
  ];

  // 현재 사용자 역할에 따라 필터링된 링크
  const filteredLinks = links.filter(link => 
    !link.roles || link.roles.includes(user?.role || '')
  );

  return (
    <>
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: open ? 0 : -280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform lg:translate-x-0 lg:static lg:inset-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-800">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-indigo-300" />
            <span className="ml-2 font-bold text-lg">피트니스 관리</span>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X size={24} className="text-indigo-300 hover:text-white transition-colors" />
          </button>
        </div>

        <div className="py-4">
          <div className="px-4 mb-6">
            <div className="flex items-center px-2 py-3 rounded-lg bg-indigo-800/50">
              <div className="flex-shrink-0">
                <img 
                  src={user?.profileImage || "https://via.placeholder.com/40"} 
                  alt={user?.name} 
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-indigo-300">{user?.role === 'admin' ? '관리자' : user?.role === 'trainer' ? '트레이너' : '직원'}</p>
              </div>
            </div>
          </div>

          <nav className="px-2 space-y-1">
            {filteredLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                  if (open) setOpen(false);
                }}
                className={clsx(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  location.pathname === link.path
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                )}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-indigo-800">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-indigo-100 hover:text-white rounded-lg bg-indigo-800 hover:bg-indigo-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;