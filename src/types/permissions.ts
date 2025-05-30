// 🔐 권한 관리 시스템 정의 - 부서별 역할 시스템

// 사용자 역할 정의 (부서별)
export type UserRole = 'admin' | 'reception' | 'fitness' | 'tennis' | 'golf';

// 세부 직책 정의 (각 부서에서 사용 가능)
export type UserPosition = 
  | '팀장' | '부팀장' | '매니저' | '과장'
  | '시니어 트레이너' | '트레이너' | '퍼스널 트레이너' | '인턴 트레이너'
  | '리셉션 매니저' | '리셉션 직원'
  | '코치' | '테니스 코치' | '어시스턴트 코치'
  | '프로' | '골프 프로' | '어시스턴트 프로'
  | '사원' | '인턴';

// 권한 카테고리별 세부 권한 정의
export type Permission = 
  // 사용자 관리
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.view_all'
  | 'users.view_department'
  | 'users.view_own'
  
  // 업무 관리
  | 'tasks.create'
  | 'tasks.read'
  | 'tasks.update'
  | 'tasks.delete'
  | 'tasks.assign'
  | 'tasks.view_all'
  | 'tasks.view_department'
  | 'tasks.view_assigned'
  | 'tasks.view_own'
  | 'tasks.comment'
  
  // 공지사항 관리
  | 'announcements.create'
  | 'announcements.read'
  | 'announcements.update'
  | 'announcements.delete'
  | 'announcements.publish'
  
  // 보고서 관리
  | 'reports.create'
  | 'reports.read'
  | 'reports.update'
  | 'reports.delete'
  | 'reports.view_all'
  | 'reports.view_department'
  | 'reports.view_own'
  | 'reports.approve'
  
  // 매출 관리
  | 'sales.create'
  | 'sales.read'
  | 'sales.update'
  | 'sales.delete'
  | 'sales.view_all'
  | 'sales.view_department'
  | 'sales.view_own'
  
  // 회원 관리
  | 'members.create'
  | 'members.read'
  | 'members.update'
  | 'members.delete'
  | 'members.view_all'
  | 'members.view_department'
  | 'members.view_assigned'
  
  // 일정 관리
  | 'schedules.create'
  | 'schedules.read'
  | 'schedules.update'
  | 'schedules.delete'
  | 'schedules.view_all'
  | 'schedules.view_department'
  | 'schedules.view_own'
  
  // OT 관리
  | 'ot.create'
  | 'ot.read'
  | 'ot.update'
  | 'ot.delete'
  | 'ot.assign'
  | 'ot.view_all'
  | 'ot.view_assigned'
  | 'ot.progress_update'
  
  // 패스 관리
  | 'pass.create'
  | 'pass.read'
  | 'pass.update'
  | 'pass.delete'
  | 'pass.view_all'
  
  // 자판기 매출
  | 'vending.create'
  | 'vending.read'
  | 'vending.update'
  | 'vending.view_all'
  | 'vending.view_own'
  
  // 건의사항
  | 'suggestions.create'
  | 'suggestions.read'
  | 'suggestions.update'
  | 'suggestions.delete'
  | 'suggestions.respond'
  | 'suggestions.view_all'
  | 'suggestions.view_own'
  
  // 매뉴얼
  | 'manuals.read'
  | 'manuals.create'
  | 'manuals.update'
  | 'manuals.delete'
  
  // 관리 기능
  | 'admin.dashboard'
  | 'admin.settings'
  | 'admin.logs'
  | 'admin.backup'
  
  // 알림 관리
  | 'notifications.send'
  | 'notifications.manage';

// 부서별 권한 매핑
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // 관리자는 모든 권한 보유
    'users.create', 'users.read', 'users.update', 'users.delete', 'users.view_all',
    'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.assign', 'tasks.view_all', 'tasks.view_assigned', 'tasks.view_own', 'tasks.comment',
    'announcements.create', 'announcements.read', 'announcements.update', 'announcements.delete', 'announcements.publish',
    'reports.create', 'reports.read', 'reports.update', 'reports.delete', 'reports.view_all', 'reports.approve',
    'sales.create', 'sales.read', 'sales.update', 'sales.delete', 'sales.view_all', 'sales.view_own',
    'members.create', 'members.read', 'members.update', 'members.delete', 'members.view_all',
    'schedules.create', 'schedules.read', 'schedules.update', 'schedules.delete', 'schedules.view_all',
    'ot.create', 'ot.read', 'ot.update', 'ot.delete', 'ot.assign', 'ot.view_all', 'ot.view_assigned', 'ot.progress_update',
    'pass.create', 'pass.read', 'pass.update', 'pass.delete', 'pass.view_all',
    'vending.create', 'vending.read', 'vending.update', 'vending.view_all', 'vending.view_own',
    'suggestions.create', 'suggestions.read', 'suggestions.update', 'suggestions.delete', 'suggestions.respond', 'suggestions.view_all', 'suggestions.view_own',
    'manuals.read', 'manuals.create', 'manuals.update', 'manuals.delete',
    'admin.dashboard', 'admin.settings', 'admin.logs', 'admin.backup',
    'notifications.send', 'notifications.manage'
  ],
  
  reception: [
    // 리셉션팀: 회원 관리, 일정 관리, 매출 관리, OT 배정 중심
    'users.view_own',
    'tasks.create', 'tasks.read', 'tasks.update', 'tasks.view_department', 'tasks.view_assigned', 'tasks.comment',
    'announcements.read',
    'reports.create', 'reports.read', 'reports.view_department', 'reports.view_own',
    'sales.create', 'sales.read', 'sales.update', 'sales.view_all',
    'members.create', 'members.read', 'members.update', 'members.view_all',
    'schedules.create', 'schedules.read', 'schedules.update', 'schedules.view_all',
    'ot.create', 'ot.read', 'ot.update', 'ot.assign', 'ot.view_all', 'ot.view_assigned', 'ot.progress_update',
    'pass.create', 'pass.read', 'pass.update', 'pass.view_all',
    'vending.create', 'vending.read', 'vending.update', 'vending.view_all', 'vending.view_own',
    'suggestions.create', 'suggestions.read', 'suggestions.view_own',
    'manuals.read'
  ],
  
  fitness: [
    // 피트니스팀: 회원 운동 관리, 개인 트레이닝, OT 진행
    'users.view_own',
    'tasks.create', 'tasks.read', 'tasks.update', 'tasks.view_department', 'tasks.view_assigned', 'tasks.comment',
    'announcements.read',
    'reports.create', 'reports.read', 'reports.view_department', 'reports.view_own',
    'sales.create', 'sales.read', 'sales.view_department', 'sales.view_own',
    'members.read', 'members.update', 'members.view_department', 'members.view_assigned',
    'schedules.create', 'schedules.read', 'schedules.update', 'schedules.view_department', 'schedules.view_own',
    'ot.read', 'ot.view_assigned', 'ot.progress_update',
    'vending.create', 'vending.read', 'vending.view_own',
    'suggestions.create', 'suggestions.read', 'suggestions.view_own',
    'manuals.read'
  ],
  
  tennis: [
    // 테니스팀: 테니스 레슨, 코트 관리
    'users.view_own',
    'tasks.create', 'tasks.read', 'tasks.update', 'tasks.view_department', 'tasks.view_assigned', 'tasks.comment',
    'announcements.read',
    'reports.create', 'reports.read', 'reports.view_department', 'reports.view_own',
    'sales.create', 'sales.read', 'sales.view_department', 'sales.view_own',
    'members.read', 'members.update', 'members.view_department', 'members.view_assigned',
    'schedules.create', 'schedules.read', 'schedules.update', 'schedules.view_department', 'schedules.view_own',
    'ot.read', 'ot.view_assigned', 'ot.progress_update',
    'vending.create', 'vending.read', 'vending.view_own',
    'suggestions.create', 'suggestions.read', 'suggestions.view_own',
    'manuals.read'
  ],
  
  golf: [
    // 골프팀: 골프 레슨, 연습장 관리
    'users.view_own',
    'tasks.create', 'tasks.read', 'tasks.update', 'tasks.view_department', 'tasks.view_assigned', 'tasks.comment',
    'announcements.read',
    'reports.create', 'reports.read', 'reports.view_department', 'reports.view_own',
    'sales.create', 'sales.read', 'sales.view_department', 'sales.view_own',
    'members.read', 'members.update', 'members.view_department', 'members.view_assigned',
    'schedules.create', 'schedules.read', 'schedules.update', 'schedules.view_department', 'schedules.view_own',
    'ot.read', 'ot.view_assigned', 'ot.progress_update',
    'vending.create', 'vending.read', 'vending.view_own',
    'suggestions.create', 'suggestions.read', 'suggestions.view_own',
    'manuals.read'
  ]
};

// 페이지별 필요 권한 정의
export const pagePermissions: Record<string, Permission[]> = {
  '/dashboard': [],
  '/dashboard/my-tasks': ['tasks.view_assigned', 'tasks.view_own'],
  '/dashboard/all-tasks': ['tasks.view_all', 'tasks.view_department'],
  '/dashboard/admin/tasks': ['tasks.view_all', 'tasks.assign'],
  '/dashboard/admin/staff': ['users.view_all', 'users.create', 'users.update'],
  '/dashboard/admin/announcements': ['announcements.create', 'announcements.update', 'announcements.delete'],
  '/dashboard/admin/suggestions': ['admin.dashboard', 'suggestions.view_all'],
  '/dashboard/sales-report': ['sales.view_all', 'sales.view_department'],
  '/dashboard/sales-report-user': ['sales.view_own'],
  '/dashboard/sales-entry': ['sales.create'],
  '/dashboard/sales-report-create': ['reports.create', 'sales.view_department', 'sales.view_own'],
  '/dashboard/members': ['members.view_all', 'members.view_department'],
  '/dashboard/daily-report': ['reports.create', 'reports.view_own'],
  '/dashboard/customer/list': ['members.view_all'],
  '/dashboard/schedules': ['schedules.view_all', 'schedules.view_department', 'schedules.view_own'],
  '/dashboard/ot-assignment': ['ot.view_all', 'ot.view_assigned', 'ot.assign'],
  '/dashboard/pass-management': ['pass.view_all', 'pass.create'],
  '/dashboard/vending-sales': ['vending.create', 'vending.view_all', 'vending.view_own'],
  '/dashboard/announcements': ['announcements.read'],
  '/dashboard/manuals': ['manuals.read'],
  '/dashboard/suggestions': ['suggestions.create', 'suggestions.read', 'suggestions.view_own']
};

// 데이터 접근 레벨 정의
export type DataAccessLevel = 'all' | 'department' | 'assigned' | 'own' | 'none';

// 부서별 데이터 접근 레벨
export const roleDataAccess: Record<UserRole, Record<string, DataAccessLevel>> = {
  admin: {
    users: 'all',
    tasks: 'all',
    reports: 'all',
    sales: 'all',
    members: 'all',
    announcements: 'all',
    schedules: 'all',
    ot: 'all',
    pass: 'all',
    vending: 'all',
    suggestions: 'all',
    manuals: 'all'
  },
  reception: {
    users: 'own',
    tasks: 'department',
    reports: 'department',
    sales: 'all',
    members: 'all',
    announcements: 'all',
    schedules: 'all',
    ot: 'all',
    pass: 'all',
    vending: 'all',
    suggestions: 'own',
    manuals: 'all'
  },
  fitness: {
    users: 'own',
    tasks: 'department',
    reports: 'department',
    sales: 'department',
    members: 'department',
    announcements: 'all',
    schedules: 'department',
    ot: 'assigned',
    pass: 'none',
    vending: 'own',
    suggestions: 'own',
    manuals: 'all'
  },
  tennis: {
    users: 'own',
    tasks: 'department',
    reports: 'department',
    sales: 'department',
    members: 'department',
    announcements: 'all',
    schedules: 'department',
    ot: 'assigned',
    pass: 'none',
    vending: 'own',
    suggestions: 'own',
    manuals: 'all'
  },
  golf: {
    users: 'own',
    tasks: 'department',
    reports: 'department',
    sales: 'department',
    members: 'department',
    announcements: 'all',
    schedules: 'department',
    ot: 'assigned',
    pass: 'none',
    vending: 'own',
    suggestions: 'own',
    manuals: 'all'
  }
};

// 권한 검사 유틸리티 함수들
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const hasPageAccess = (userRole: UserRole, pathname: string): boolean => {
  const requiredPermissions = pagePermissions[pathname];
  
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // 권한이 필요하지 않은 페이지
  }
  
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

export const getDataAccessLevel = (userRole: UserRole, dataType: string): DataAccessLevel => {
  return roleDataAccess[userRole]?.[dataType] || 'none';
};

export const canModifyData = (userRole: UserRole, dataType: string, dataOwnerId?: string, currentUserId?: string): boolean => {
  const accessLevel = getDataAccessLevel(userRole, dataType);
  
  switch (accessLevel) {
    case 'all':
      return true;
    case 'department':
      // TODO: 부서 정보를 활용한 검사 구현
      return true;
    case 'assigned':
      // TODO: 배정된 데이터인지 검사 구현
      return true;
    case 'own':
      return dataOwnerId === currentUserId;
    case 'none':
    default:
      return false;
  }
};

// 부서별 한글 이름 매핑
export const departmentNames: Record<UserRole, string> = {
  admin: '관리자',
  reception: '리셉션',
  fitness: '피트니스',
  tennis: '테니스',
  golf: '골프'
};

// 직책별 한글 이름과 권한 레벨 정의
export const positionInfo: Record<UserPosition, { name: string; level: number; canManageTeam: boolean }> = {
  '팀장': { name: '팀장', level: 5, canManageTeam: true },
  '부팀장': { name: '부팀장', level: 4, canManageTeam: true },
  '매니저': { name: '매니저', level: 4, canManageTeam: true },
  '과장': { name: '과장', level: 3, canManageTeam: true },
  '리셉션 매니저': { name: '리셉션 매니저', level: 4, canManageTeam: true },
  '시니어 트레이너': { name: '시니어 트레이너', level: 3, canManageTeam: false },
  '트레이너': { name: '트레이너', level: 2, canManageTeam: false },
  '퍼스널 트레이너': { name: '퍼스널 트레이너', level: 2, canManageTeam: false },
  '코치': { name: '코치', level: 2, canManageTeam: false },
  '테니스 코치': { name: '테니스 코치', level: 2, canManageTeam: false },
  '프로': { name: '프로', level: 3, canManageTeam: false },
  '골프 프로': { name: '골프 프로', level: 3, canManageTeam: false },
  '리셉션 직원': { name: '리셉션 직원', level: 2, canManageTeam: false },
  '어시스턴트 코치': { name: '어시스턴트 코치', level: 1, canManageTeam: false },
  '어시스턴트 프로': { name: '어시스턴트 프로', level: 1, canManageTeam: false },
  '인턴 트레이너': { name: '인턴 트레이너', level: 1, canManageTeam: false },
  '사원': { name: '사원', level: 2, canManageTeam: false },
  '인턴': { name: '인턴', level: 1, canManageTeam: false }
};

// 직책에 따른 추가 권한 검사
export const hasPositionPermission = (position: UserPosition | undefined, requiredLevel: number): boolean => {
  if (!position) return false;
  const posInfo = positionInfo[position];
  return posInfo ? posInfo.level >= requiredLevel : false;
};

export const canManageTeam = (position: UserPosition | undefined): boolean => {
  if (!position) return false;
  const posInfo = positionInfo[position];
  return posInfo ? posInfo.canManageTeam : false;
}; 