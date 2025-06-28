import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, UserRole, hasPermission, hasPageAccess } from '../types/permissions';
import { useNotification } from '../contexts/NotificationContext';

export const usePermissions = () => {
  const { user, hasPermission: authHasPermission, hasPageAccess: authHasPageAccess } = useAuth();
  const { showToast } = useNotification();

  // 권한 체크 및 에러 처리
  const checkPermission = useCallback((permission: Permission, showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    const hasAccess = authHasPermission(permission);
    if (!hasAccess && showError) {
      showToast('error', '이 작업을 수행할 권한이 없습니다.');
    }

    return hasAccess;
  }, [user, authHasPermission, showToast]);

  // 여러 권한 중 하나라도 있는지 체크 (OR 조건)
  const checkAnyPermission = useCallback((permissions: Permission[], showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    const hasAccess = permissions.some(permission => authHasPermission(permission));
    if (!hasAccess && showError) {
      showToast('error', '이 작업을 수행할 권한이 없습니다.');
    }

    return hasAccess;
  }, [user, authHasPermission, showToast]);

  // 모든 권한이 있는지 체크 (AND 조건)
  const checkAllPermissions = useCallback((permissions: Permission[], showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    const hasAccess = permissions.every(permission => authHasPermission(permission));
    if (!hasAccess && showError) {
      showToast('error', '이 작업을 수행할 권한이 없습니다.');
    }

    return hasAccess;
  }, [user, authHasPermission, showToast]);

  // 페이지 접근 권한 체크
  const checkPageAccess = useCallback((pathname: string, showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    const hasAccess = authHasPageAccess(pathname);
    if (!hasAccess && showError) {
      showToast('error', '이 페이지에 접근할 권한이 없습니다.');
    }

    return hasAccess;
  }, [user, authHasPageAccess, showToast]);

  // 역할 체크
  const checkRole = useCallback((requiredRole: UserRole | UserRole[], showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasAccess = roles.includes(user.role);
    
    if (!hasAccess && showError) {
      showToast('error', `이 작업은 ${roles.join(', ')} 권한이 필요합니다.`);
    }

    return hasAccess;
  }, [user, showToast]);

  // 데이터 소유권 체크
  const checkDataOwnership = useCallback((dataOwnerId: string, showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    // 관리자는 모든 데이터 접근 가능
    if (user.role === 'admin') {
      return true;
    }

    const isOwner = user.id === dataOwnerId;
    if (!isOwner && showError) {
      showToast('error', '본인의 데이터만 수정할 수 있습니다.');
    }

    return isOwner;
  }, [user, showToast]);

  // 부서 권한 체크
  const checkDepartmentAccess = useCallback((targetDepartment: string, showError: boolean = true): boolean => {
    if (!user) {
      if (showError) {
        showToast('error', '로그인이 필요합니다.');
      }
      return false;
    }

    // 관리자는 모든 부서 접근 가능
    if (user.role === 'admin') {
      return true;
    }

    const hasAccess = user.department === targetDepartment;
    if (!hasAccess && showError) {
      showToast('error', '같은 부서의 데이터만 접근할 수 있습니다.');
    }

    return hasAccess;
  }, [user, showToast]);

  // 안전한 액션 실행 (권한 체크 + 실행)
  const executeWithPermission = useCallback(async <T>(
    permission: Permission,
    action: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    if (!checkPermission(permission, false)) {
      showToast('error', errorMessage || '이 작업을 수행할 권한이 없습니다.');
      return null;
    }

    try {
      return await action();
    } catch (error) {
      showToast('error', '작업 실행 중 오류가 발생했습니다.');
      throw error;
    }
  }, [checkPermission, showToast]);

  // 권한별 UI 표시 여부
  const showForPermission = useCallback((permission: Permission): boolean => {
    return checkPermission(permission, false);
  }, [checkPermission]);

  const showForRole = useCallback((role: UserRole | UserRole[]): boolean => {
    return checkRole(role, false);
  }, [checkRole]);

  const showForAdmin = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user]);

  return {
    // 권한 체크 함수들
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkPageAccess,
    checkRole,
    checkDataOwnership,
    checkDepartmentAccess,
    
    // 안전한 실행
    executeWithPermission,
    
    // UI 표시 여부
    showForPermission,
    showForRole,
    showForAdmin,
    
    // 현재 사용자 정보
    currentUser: user,
    isAdmin: user?.role === 'admin',
    isReception: user?.role === 'reception',
    isFitness: user?.role === 'fitness',
    isTennis: user?.role === 'tennis',
    isGolf: user?.role === 'golf'
  };
};

export default usePermissions; 