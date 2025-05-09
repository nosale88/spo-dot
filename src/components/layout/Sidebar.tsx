import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Briefcase, 
  LayoutDashboard, 
  ListChecks, 
  List, 
  FileText, 
  MessageSquare, 
  Megaphone, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Users,
  ClipboardList,
  Archive, // 아이콘 임포트 추가
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

interface SidebarLink {
  name: string;
  path: string;
  icon: JSX.Element;
  section: 'menu' | 'admin';
  roles?: string[];
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024;

  const menuItems: SidebarLink[] = [
    { name: '대시보드', path: '/dashboard', icon: <LayoutDashboard size={22} />, section: 'menu' },
    { name: '내 업무', path: '/my-tasks', icon: <ListChecks size={22} />, section: 'menu' },
    { name: '전체 업무 보기', path: '/all-tasks', icon: <List size={22} />, section: 'menu' },
    { name: '일일 업무 보고', path: '/daily-report', icon: <FileText size={22} />, section: 'menu' },
    { name: '건의사항', path: '/suggestions', icon: <MessageSquare size={22} />, section: 'menu' },
  ];

  const adminMenuItems: SidebarLink[] = [
    { name: '직원 관리', path: '/admin/staff-management', icon: <Users size={22} />, roles: ['admin'], section: 'admin' },
    { name: '업무 관리', path: '/admin/tasks', icon: <ClipboardList size={22} />, roles: ['admin'], section: 'admin' }, 
    { name: '건의사항 관리', path: '/admin/suggestions-management', icon: <Archive size={22} />, roles: ['admin'], section: 'admin' },
    { name: '공지사항 관리', path: '/admin/announcements', icon: <Megaphone size={22} />, roles: ['admin'], section: 'admin' },
  ];

  const links: SidebarLink[] = [...menuItems, ...adminMenuItems];

  const filteredLinks = links.filter(link => 
    !link.roles || (user?.role && link.roles.includes(user.role))
  );

  const generalMenuLinks = filteredLinks.filter(link => link.section === 'menu');
  const adminMenuLinks = filteredLinks.filter(link => link.section === 'admin' && user?.role === 'admin');

  return (
    <>
      <motion.aside
        initial={{ width: open ? 256 : 80 }}
        animate={{ width: open ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-indigo-900 text-white transform lg:static lg:inset-auto',
          'flex flex-col overflow-hidden',
          open ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-800">
          <div className="flex items-center overflow-hidden">
            <Briefcase className="h-8 w-8 text-indigo-300 flex-shrink-0" />
            {open && <span className="ml-2 font-bold text-lg whitespace-nowrap overflow-hidden">업무 관리 시스템</span>}
          </div>
          <button 
            onClick={() => setOpen(!open)}
            className="flex-shrink-0 text-indigo-300 hover:text-white transition-colors"
          >
            {open ? 
              <ChevronLeft size={24} /> : 
              <ChevronRight size={24} />
            }
          </button>
        </div>

        <div className="py-4 flex-1 overflow-y-auto">
          {open ? (
            <div className="px-4 mb-6">
              <div className="flex items-center px-2 py-3 rounded-lg bg-indigo-800/50">
                <div className="flex-shrink-0">
                  <img 
                    src={user?.profileImage || "https://via.placeholder.com/40"} 
                    alt={user?.name || 'User'} 
                    className="h-10 w-10 rounded-full"
                  />
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-indigo-300">{user?.role === 'admin' ? '관리자' : user?.role === 'trainer' ? '트레이너' : '직원'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-2 mb-6 flex justify-center">
              <div className="flex-shrink-0">
                <img 
                  src={user?.profileImage || "https://via.placeholder.com/40"} 
                  alt={user?.name || 'User'} 
                  className="h-10 w-10 rounded-full"
                />
              </div>
            </div>
          )}

          <nav className="px-2 space-y-1">
            {/* 일반 메뉴 항목 */}
            {generalMenuLinks.length > 0 && (
              <>
                {open && (
                  <div className="mt-2 mb-2 px-4">
                    <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                      메뉴
                    </h3>
                  </div>
                )}
                {generalMenuLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={clsx(
                      'flex items-center px-4 py-3 rounded-lg transition-colors',
                      location.pathname.startsWith(link.path)
                        ? 'bg-primary text-white'
                        : 'hover:bg-indigo-900/30 text-indigo-100',
                      !open && 'justify-center px-2'
                    )}
                    onClick={() => isMobile && setOpen(false)}
                    title={!open ? link.name : ''}
                  >
                    <span className={clsx(!open && 'mr-0', open && 'mr-3')}>{link.icon}</span>
                    {open && <span className="truncate">{link.name}</span>}
                  </Link>
                ))}
              </>
            )}
            
            {/* 관리자 메뉴 섹션 */}
            {adminMenuLinks.length > 0 && (
              <>
                {open && (
                  <div className="mt-6 mb-2 px-4">
                    <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                      관리자 메뉴
                    </h3>
                  </div>
                )}
                {!open && <div className="mt-6 mb-2 border-t border-indigo-800"></div>}
                
                {adminMenuLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={clsx(
                      'flex items-center px-4 py-3 rounded-lg transition-colors',
                      location.pathname.startsWith(link.path)
                        ? 'bg-primary text-white'
                        : 'hover:bg-indigo-900/30 text-indigo-100',
                      !open && 'justify-center px-2'
                    )}
                    onClick={() => isMobile && setOpen(false)}
                    title={!open ? link.name : ''}
                  >
                    <span className={clsx(!open && 'mr-0', open && 'mr-3')}>{link.icon}</span>
                    {open && <span className="truncate">{link.name}</span>}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={clsx(
              'flex items-center text-indigo-100 hover:text-white rounded-lg bg-indigo-800 hover:bg-indigo-700 transition-colors',
              open ? 'w-full px-4 py-2' : 'mx-auto p-2'
            )}
            title={!open ? '로그아웃' : ''}
          >
            <LogOut size={20} className={clsx(open && 'mr-2')} />
            {open && <span className="text-sm">로그아웃</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;