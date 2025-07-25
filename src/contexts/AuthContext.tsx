import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiService } from '@/services/api';
import { secureApiService } from '@/services/secureApiService';
import { 
  UserRole, 
  UserPosition, 
  Permission, 
  DataAccessLevel,
  rolePermissions,
  hasPermission as checkPermission,
  hasPageAccess as checkPageAccess,
  getDataAccessLevel,
  canModifyData as checkCanModifyData,
  filterDataByPermission,
  hasElevatedPermission,
  checkPermissionWithReason
} from '@/types/permissions';
import { isSessionValid, refreshSession } from '@/utils/securityUtils';

// User 인터페이스 정의
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: UserPosition;
  avatar?: string;
  permissions?: string[]; // 개별 설정된 권한 추가
}

// AuthContext 타입 정의
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  
  // 🔐 기본 권한 관리 함수들
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasPageAccess: (pathname: string) => boolean;
  getDataAccess: (dataType: string) => DataAccessLevel;
  
  // 🛡️ 강화된 권한 검사 함수들
  canModifyData: (dataType: string, dataOwnerId?: string, itemDepartment?: string, assignedUsers?: string[]) => boolean;
  filterUserData: <T extends { created_by?: string; assigned_to?: string | string[]; department?: string; id?: string }>(data: T[], dataType: string) => T[];
  hasElevatedAccess: (level: 'team_lead' | 'manager' | 'admin') => boolean;
  checkPermissionWithDetails: (permission: Permission) => { allowed: boolean; reason: string };
  
  // 편의 함수들
  isAdmin: boolean;
  isReception: boolean;
  isFitness: boolean;
  isTennis: boolean;
  isGolf: boolean;
  isManager: boolean;
  isTeamLead: boolean;
  
  // 🔐 보안 강화 함수들
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  validateSession: () => boolean;
  refreshUserSession: () => Promise<boolean>;
}

// 기본 Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 저장된 사용자 정보 확인
    const checkAuth = async () => {
      try {
        // 세션 유효성 검사
        if (!isSessionValid()) {
          localStorage.removeItem('currentUserId');
          localStorage.removeItem('currentUserName');
          localStorage.removeItem('authToken');
          setIsLoading(false);
          return;
        }

        const currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
          // API 서비스 사용
          const response = await apiService.auth.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            
            // 세션 자동 갱신
            await refreshSession();
          } else {
            // 인증 실패 시 로그아웃 처리
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUserName');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 세션 유효성을 주기적으로 확인 (5분마다)
    const sessionCheck = setInterval(() => {
      if (!isSessionValid()) {
        logout();
      } else {
        refreshSession();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(sessionCheck);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // API 서비스 사용
      const response = await apiService.auth.login({ email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || '로그인에 실패했습니다.');
      }
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('currentUserId', response.data.user.id);
      localStorage.setItem('currentUserName', response.data.user.name);
      localStorage.setItem('authToken', response.data.token);
      
      setUser(response.data.user);
      console.log('✅ 로그인 성공:', response.data.user.role);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUserName');
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  // 🔐 보안 강화 함수들
  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await secureApiService.auth.changePassword(currentPassword, newPassword);
    if (!response.success) {
      throw new Error(response.error || '비밀번호 변경에 실패했습니다.');
    }
  };

  const validateSession = useCallback((): boolean => {
    return isSessionValid();
  }, []);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      const result = await refreshSession();
      if (!result) {
        await logout();
        return false;
      }
      return true;
    } catch {
      await logout();
      return false;
    }
  }, []);

  // 🔐 권한 관리 함수들 - 개별 권한과 역할별 권한을 모두 고려
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    // 1. 역할별 기본 권한 확인
    const basePermissions = rolePermissions[user.role] || [];
    
    // 2. 개별 설정된 권한 확인 (데이터베이스에서 가져온)
    const customPermissions = user.permissions || [];
    
    // 3. 모든 권한 조합
    const allPermissions = [...basePermissions, ...customPermissions];
    
    // 4. 권한 확인 (중복 제거)
    const hasAccess = allPermissions.includes(permission);
    
    // 5. 권한 체크 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log(`권한 체크: ${permission}`, {
        user: user.name,
        role: user.role,
        hasAccess,
        basePermissions: basePermissions.length,
        customPermissions: customPermissions.length
      });
    }
    
    return hasAccess;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission]);

  const hasPageAccess = useCallback((pathname: string): boolean => {
    if (!user) return false;
    return checkPageAccess(user.role, pathname);
  }, [user]);

  const getDataAccess = useCallback((dataType: string): DataAccessLevel => {
    if (!user) return 'none';
    return getDataAccessLevel(user.role, dataType);
  }, [user]);

  const canModifyData = useCallback((dataType: string, dataOwnerId?: string, itemDepartment?: string, assignedUsers?: string[]): boolean => {
    if (!user) return false;
    return checkCanModifyData(user.role, dataType, dataOwnerId, user.id, user.department, itemDepartment, assignedUsers);
  }, [user]);

  const filterUserData = useCallback(<T extends { created_by?: string; assigned_to?: string | string[]; department?: string; id?: string }>(data: T[], dataType: string): T[] => {
    if (!user) return [];
    return filterDataByPermission(data, user.role, dataType, user.id, user.department);
  }, [user]);

  const hasElevatedAccess = useCallback((level: 'team_lead' | 'manager' | 'admin'): boolean => {
    if (!user) return false;
    return hasElevatedPermission(user.role, user.position, level);
  }, [user]);

  const checkPermissionWithDetails = useCallback((permission: Permission): { allowed: boolean; reason: string } => {
    if (!user) return { allowed: false, reason: '로그인이 필요합니다.' };
    return checkPermissionWithReason(user.role, permission, user.position);
  }, [user]);

  // 편의 함수들
  const isAdmin = user?.role === 'admin';
  const isReception = user?.role === 'reception';
  const isFitness = user?.role === 'fitness';
  const isTennis = user?.role === 'tennis';
  const isGolf = user?.role === 'golf';
  const isManager = user?.position ? ['팀장', '부팀장', '매니저', '리셉션 매니저'].includes(user.position) : false;
  const isTeamLead = user?.position ? ['팀장', '부팀장'].includes(user.position) : false;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasPageAccess,
    getDataAccess,
    canModifyData,
    filterUserData,
    hasElevatedAccess,
    checkPermissionWithDetails,
    isAdmin,
    isReception,
    isFitness,
    isTennis,
    isGolf,
    isManager,
    isTeamLead,
    changePassword,
    validateSession,
    refreshUserSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 