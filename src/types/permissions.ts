// 🔐 권한 관리 시스템 정의 - 부서별 역할 시스템

// 사용자 역할 정의 (애플리케이션 내부에서 사용)
export type UserRole = 'admin' | 'reception' | 'fitness' | 'tennis' | 'golf';

// 데이터베이스 역할 정의 (Supabase users 테이블의 role 컬럼과 일치)
export type DatabaseRole = 'admin' | 'trainer' | 'staff' | 'user' | 'client';

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

// 역할별 권한 매핑 (UserRole 기반 유지)
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

// 페이지별 필요 권한 정의 (UserRole 기반 유지)
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

// 부서별 데이터 접근 레벨 (UserRole 기반 유지)
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
    manuals: 'all',
    notifications: 'all'
  },
  reception: {
    users: 'own',
    tasks: 'department',
    reports: 'department',
    sales: 'all', // 리셉션은 모든 매출 조회
    members: 'all',
    announcements: 'all',
    schedules: 'all',
    ot: 'all',
    pass: 'all',
    vending: 'all',
    suggestions: 'own',
    manuals: 'all',
    notifications: 'own'
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
    manuals: 'all',
    notifications: 'own'
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
    manuals: 'all',
    notifications: 'own'
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
    manuals: 'all',
    notifications: 'own'
  }
};

// 사용자 권한 확인 함수
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const permissionsForRole = rolePermissions[userRole];
  if (!permissionsForRole) return false;
  return permissionsForRole.includes(permission);
};

// 페이지 접근 권한 확인
export const hasPageAccess = (userRole: UserRole, pathname: string): boolean => {
  const requiredPermissions = pagePermissions[pathname];
  if (!requiredPermissions || requiredPermissions.length === 0) return true; // 권한이 필요 없는 페이지

  return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

// 데이터 접근 레벨 가져오기
export const getDataAccessLevel = (userRole: UserRole, dataType: string): DataAccessLevel => {
  return roleDataAccess[userRole]?.[dataType] || 'none';
};

// 데이터 수정 권한 확인
export const canModifyData = (userRole: UserRole, dataType: string, dataOwnerId?: string, currentUserId?: string): boolean => {
  const accessLevel = getDataAccessLevel(userRole, dataType);

  if (userRole === 'admin') return true; // 관리자는 모든 데이터 수정 가능

  switch (accessLevel) {
    case 'all': return true;
    case 'department':
      // 이 부분은 department 정보를 기반으로 추가 로직 필요
      return true; // 임시: department 개념이 현재 이 함수에 전달되지 않음
    case 'assigned':
      // 이 부분은 assigned 정보를 기반으로 추가 로직 필요
      return true; // 임시: assigned 개념이 현재 이 함수에 전달되지 않음
    case 'own': return dataOwnerId === currentUserId;
    default: return false;
  }
};

// 직책별 권한 레벨 (숫자가 높을수록 높은 권한)
export const positionLevels: Record<UserPosition, number> = {
  '팀장': 5,
  '부팀장': 4,
  '매니저': 4,
  '과장': 3,
  '시니어 트레이너': 3,
  '트레이너': 2,
  '퍼스널 트레이너': 2,
  '인턴 트레이너': 1,
  '리셉션 매니저': 3,
  '리셉션 직원': 2,
  '코치': 2,
  '테니스 코치': 2,
  '어시스턴트 코치': 1,
  '프로': 3,
  '골프 프로': 3,
  '어시스턴트 프로': 2,
  '사원': 1,
  '인턴': 0
};

export const positionInfo: Record<UserPosition, { name: string; description: string; departments: UserRole[] }> = {
  '팀장': { name: '팀장', description: '각 팀의 리더로, 팀 운영 및 성과 관리 책임을 가집니다.', departments: ['reception', 'fitness', 'tennis', 'golf'] },
  '부팀장': { name: '부팀장', description: '팀장을 보좌하며, 팀 운영의 실무를 담당합니다.', departments: ['reception', 'fitness', 'tennis', 'golf'] },
  '매니저': { name: '매니저', description: '운영 전반을 관리하고 감독합니다.', departments: ['admin'] }, // admin role에만 매니저 직책이 있다고 가정
  '과장': { name: '과장', description: '특정 업무 분야를 총괄합니다.', departments: ['admin', 'reception', 'fitness', 'tennis', 'golf'] },
  '시니어 트레이너': { name: '시니어 트레이너', description: '경험 많은 트레이너로, 주니어 트레이너를 지도합니다.', departments: ['fitness'] },
  '트레이너': { name: '트레이너', description: '회원들에게 운동 지도를 제공합니다.', departments: ['fitness'] },
  '퍼스널 트레이너': { name: '퍼스널 트레이너', description: '개인별 맞춤 운동 프로그램을 제공합니다.', departments: ['fitness'] },
  '인턴 트레이너': { name: '인턴 트레이너', description: '트레이닝 경험을 쌓는 인턴 직원입니다.', departments: ['fitness'] },
  '리셉션 매니저': { name: '리셉션 매니저', description: '리셉션 업무를 총괄하고 직원을 관리합니다.', departments: ['reception'] },
  '리셉션 직원': { name: '리셉션 직원', description: '고객 응대 및 시설 안내를 담당합니다.', departments: ['reception'] },
  '코치': { name: '코치', description: '스포츠 분야 전문 코치입니다.', departments: ['tennis', 'golf'] },
  '테니스 코치': { name: '테니스 코치', description: '테니스 레슨 및 코트 관리를 담당합니다.', departments: ['tennis'] },
  '어시스턴트 코치': { name: '어시스턴트 코치', description: '코치를 보좌하며 레슨을 돕습니다.', departments: ['tennis', 'golf'] },
  '프로': { name: '프로', description: '전문 스포츠 선수 출신으로, 상위 레벨 지도를 담당합니다.', departments: ['tennis', 'golf'] },
  '골프 프로': { name: '골프 프로', description: '골프 레슨 및 연습장 관리를 담당합니다.', departments: ['golf'] },
  '어시스턴트 프로': { name: '어시스턴트 프로', description: '골프 프로를 보좌하며 레슨을 돕습니다.', departments: ['golf'] },
  '사원': { name: '사원', description: '일반적인 사무 업무 및 지원을 담당합니다.', departments: ['reception', 'fitness', 'tennis', 'golf'] },
  '인턴': { name: '인턴', description: '다양한 업무를 경험하는 인턴 직원입니다.', departments: ['reception', 'fitness', 'tennis', 'golf'] }
};

export const hasPositionPermission = (position: UserPosition | undefined, requiredLevel: number): boolean => {
  if (!position) return false;
  const level = positionLevels[position];
  return level >= requiredLevel;
};

export const canManageTeam = (position: UserPosition | undefined): boolean => {
  if (!position) return false;
  return positionLevels[position] >= positionLevels['팀장'];
};

// Mapping from UserRole to DatabaseRole
export const mapUserRoleToDatabaseRole = (userRole: UserRole): DatabaseRole => {
  switch (userRole) {
    case 'admin':
      return 'admin';
    case 'reception':
    case 'fitness':
    case 'tennis':
    case 'golf':
      return 'staff'; // Assuming these roles map to 'staff' in the database
    default:
      return 'staff'; // Fallback
  }
}; 