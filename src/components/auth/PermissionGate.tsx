import React, { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission, UserRole } from '../../types/permissions';
import { ShieldX, Lock } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission | Permission[];
  role?: UserRole | UserRole[];
  requireAll?: boolean; // true면 모든 권한 필요, false면 하나만 필요
  fallback?: ReactNode;
  showFallback?: boolean;
  silent?: boolean; // true면 권한 없을 때 아무것도 렌더링하지 않음
}

/**
 * 권한 기반 UI 렌더링 컴포넌트
 * 사용자의 권한에 따라 UI 요소를 조건부로 표시합니다.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  requireAll = false,
  fallback,
  showFallback = false,
  silent = false
}) => {
  const {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkRole,
    currentUser
  } = usePermissions();

  // 로그인하지 않은 경우
  if (!currentUser) {
    if (silent) return null;
    if (fallback) return <>{fallback}</>;
    if (!showFallback) return null;
    
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Lock className="w-4 h-4" />
        <span>로그인이 필요합니다</span>
      </div>
    );
  }

<<<<<<< HEAD
  let hasAccess = true;

  // 권한 체크
=======
  // 권한과 역할이 모두 지정되지 않은 경우 항상 표시
  if (!permission && !role) {
    return <>{children}</>;
  }

  let hasRequiredPermission = true;
  let hasRequiredRole = true;

  // 권한 검사 (권한이 지정된 경우만)
>>>>>>> 44f164cad4e06545f0588bfd7c5302c9923da970
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    
    if (requireAll) {
      hasAccess = checkAllPermissions(permissions, false);
    } else {
      hasAccess = checkAnyPermission(permissions, false);
    }
  }

<<<<<<< HEAD
  // 역할 체크 (권한 체크와 AND 조건)
  if (hasAccess && role) {
    hasAccess = checkRole(role, false);
  }

  // 권한이 있는 경우 children 렌더링
  if (hasAccess) {
    return <>{children}</>;
=======
  // 역할 검사 (역할이 지정된 경우만)
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    
    if (showIf === 'all') {
      hasRequiredRole = roles.every(r => user.role === r);
    } else {
      hasRequiredRole = roles.some(r => user.role === r);
    }
  }

  // 조건 결합: 권한과 역할이 모두 지정된 경우 둘 다 만족해야 함
  let shouldShow = true;
  
  if (permission && role) {
    // 권한과 역할이 모두 지정된 경우: 둘 다 만족해야 함
    shouldShow = hasRequiredPermission && hasRequiredRole;
  } else if (permission) {
    // 권한만 지정된 경우: 권한만 확인
    shouldShow = hasRequiredPermission;
  } else if (role) {
    // 역할만 지정된 경우: 역할만 확인
    shouldShow = hasRequiredRole;
>>>>>>> 44f164cad4e06545f0588bfd7c5302c9923da970
  }

  // 권한이 없는 경우 처리
  if (silent) return null;
  if (fallback) return <>{fallback}</>;
  if (!showFallback) return null;

  return (
    <div className="flex items-center gap-2 text-slate-500 text-sm">
      <ShieldX className="w-4 h-4" />
      <span>권한이 없습니다</span>
    </div>
  );
};

// 편의 컴포넌트들
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate role="admin" fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const ReceptionOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate role="reception" fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const StaffOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate role={['admin', 'reception', 'fitness', 'tennis', 'golf']} fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const ManagerLevel: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate role={['admin', 'reception']} fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const OperationTeam: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate role={['admin', 'reception', 'fitness', 'tennis', 'golf']} fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

// 특정 권한 기반 컴포넌트들
export const CanCreateTasks: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission="tasks.create" fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const CanViewAllTasks: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission={['tasks.read', 'tasks.view_all']} fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const CanManageUsers: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission="users.create" fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const CanManageAnnouncements: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission={['announcements.create', 'announcements.update', 'announcements.delete']} fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const CanManageMembers: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission={['members.create', 'members.update', 'members.delete']} fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const CanCreateAnnouncements: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission="announcements.create" fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export const CanViewReports: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGate permission="reports.read" fallback={fallback} silent={!fallback}>
    {children}
  </PermissionGate>
);

export default PermissionGate; 