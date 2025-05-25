import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  ChevronDown,
  Users,
  ClipboardList,
  Archive,
  Phone,
  CalendarDays,
  UserCheck,
  DollarSign,
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
};

interface SidebarLink {
  name: string;
  path: string;
  icon: JSX.Element;
  section: 'menu' | 'admin' | 'customer';
  roles?: string[];
}



const Sidebar = ({ open, setOpen, isMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems: SidebarLink[] = [
    { name: '대시보드', path: '/dashboard', icon: <LayoutDashboard size={22} />, section: 'menu' },
    { name: '내 업무', path: '/dashboard/my-tasks', icon: <ListChecks size={22} />, section: 'menu' },
    { name: '전체 업무 보기', path: '/dashboard/all-tasks', icon: <List size={22} />, section: 'menu' },
    { name: '일일 업무 보고', path: '/dashboard/daily-report', icon: <FileText size={22} />, section: 'menu' },
    { name: '매출 등록', path: '/dashboard/sales-entry', icon: <DollarSign size={22} />, section: 'menu' },
    { name: '매출 보고 작성', path: '/dashboard/sales-report-user', icon: <FileText size={22} />, section: 'menu' },
    { name: '건의사항', path: '/dashboard/suggestions', icon: <MessageSquare size={22} />, section: 'menu' },
    { name: '이용권 관리', path: '/dashboard/pass-management', icon: <Briefcase size={22} />, section: 'menu' },
    { name: 'OT배정', path: '/dashboard/ot-assignment', icon: <Briefcase size={22} />, section: 'menu' },
    { name: '자판기 매출', path: '/dashboard/vending-sales', icon: <Briefcase size={22} />, section: 'menu' },
  ];

  const customerMenuItems: SidebarLink[] = [
    { name: '고객 관리', path: '/dashboard/customer/list', icon: <Users size={22} />, section: 'customer', roles: ['admin'] },
  ];

  const adminMenuItems: SidebarLink[] = [
    { name: '직원 관리', path: '/dashboard/admin/staff', icon: <Users size={22} />, roles: ['admin'], section: 'admin' },
    { name: '업무 관리', path: '/dashboard/admin/tasks', icon: <ClipboardList size={22} />, roles: ['admin'], section: 'admin' }, 
    { name: '건의사항 관리', path: '/dashboard/admin/suggestions', icon: <Archive size={22} />, roles: ['admin'], section: 'admin' },
    { name: '공지사항 관리', path: '/dashboard/admin/announcements', icon: <Megaphone size={22} />, roles: ['admin'], section: 'admin' },
    { name: '매출보고 관리', path: '/dashboard/sales-report', icon: <FileText size={22} />, roles: ['admin'], section: 'admin' },
  ];

  const links: SidebarLink[] = [...menuItems, ...customerMenuItems, ...adminMenuItems];

  const filteredLinks = links.filter(link => 
    !link.roles || (user?.role && link.roles.includes(user.role))
  );

  const generalMenuLinks = filteredLinks.filter(link => link.section === 'menu');
  const adminMenuLinks = filteredLinks.filter(link => link.section === 'admin' && user?.role === 'admin');
  const customerMenuLinks = filteredLinks.filter(link => link.section === 'customer' && user?.role === 'admin');

  return (
    <div
      className={clsx(
        'fixed inset-y-0 left-0 z-50 bg-indigo-900 text-white transform',
        'flex flex-col overflow-hidden shadow-xl',
        'transition-all duration-300 ease-in-out',
        isMobile
          ? open
            ? 'w-[80%] min-w-[260px] max-w-[300px] translate-x-0'
            : 'w-0 -translate-x-full'
          : open
            ? 'w-64'
            : 'w-20'
      )}
      style={{
        // iOS Safari에서 메모리 최적화를 위해
        willChange: 'transform',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-800">
        <div className="flex items-center overflow-hidden">
          <Briefcase className="h-8 w-8 text-indigo-300 flex-shrink-0" />
          {open && <span className="ml-2 font-bold text-lg whitespace-nowrap overflow-hidden">업무 관리 시스템</span>}
        </div>
        <button 
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 text-indigo-300 hover:text-white transition-colors hidden lg:flex"
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
              <div className="ml-0 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-indigo-300">{user?.role === 'admin' ? '관리자' : user?.role === 'trainer' ? '트레이너' : '직원'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-2 mb-6 flex justify-center"></div>
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
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault(); // 기본 링크 동작 방지
                      setOpen(false); // 사이드바 닫기
                      // 약간의 지연 후 네비게이션 실행
                      setTimeout(() => {
                        navigate(link.path);
                      }, 10);
                    }
                  }}
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
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault(); // 기본 링크 동작 방지
                      setOpen(false); // 사이드바 닫기
                      // 약간의 지연 후 네비게이션 실행
                      setTimeout(() => {
                        navigate(link.path);
                      }, 10);
                    }
                  }}
                  title={!open ? link.name : ''}
                >
                  <span className={clsx(!open && 'mr-0', open && 'mr-3')}>{link.icon}</span>
                  {open && <span className="truncate">{link.name}</span>}
                </Link>
              ))}
            </>
          )}

          {/* 고객 관리 메뉴 섹션 */}
          {customerMenuLinks.length > 0 && (
            <>
              {open && (
                <div className="mt-6 mb-2 px-4">
                  <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    고객 관리
                  </h3>
                </div>
              )}
              {!open && <div className="mt-6 mb-2 border-t border-indigo-800"></div>}
              
              {customerMenuLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'flex items-center px-4 py-3 rounded-lg transition-colors',
                    location.pathname.startsWith('/dashboard/customer')
                      ? 'bg-primary text-white'
                      : 'hover:bg-indigo-900/30 text-indigo-100',
                    !open && 'justify-center px-2'
                  )}
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault();
                      setOpen(false);
                      setTimeout(() => {
                        navigate(link.path);
                      }, 10);
                    }
                  }}
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
    </div>
  );
};

export default Sidebar;