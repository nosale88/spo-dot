import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabaseApiService } from '../services/supabaseApi';
import { secureApiService } from '../services/secureApiService';
import { 
  UserRole, 
  Permission, 
  hasPermission as checkPermission, 
  hasPageAccess as checkPageAccess,
  getDataAccessLevel,
  canModifyData as checkDataModification,
  DataAccessLevel
} from '../types/permissions';
import { isSessionValid, refreshSession } from '../utils/securityUtils';

// AuthContext 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string; // 세부 역할 (팀장, 트레이너 등)
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  
  // 🔐 권한 관리 함수들
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasPageAccess: (pathname: string) => boolean;
  getDataAccess: (dataType: string) => DataAccessLevel;
  canModifyData: (dataType: string, dataOwnerId?: string) => boolean;
  isAdmin: boolean;
  isReception: boolean;
  isFitness: boolean;
  isTennis: boolean;
  isGolf: boolean;
  
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
          // 보안 강화된 API 사용
          const response = await secureApiService.auth.getCurrentUser();
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
      
      // 보안 강화된 로그인 사용
      const response = await secureApiService.auth.login({ email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || '로그인에 실패했습니다.');
      }
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('currentUserId', response.data.user.id);
      localStorage.setItem('currentUserName', response.data.user.name);
      localStorage.setItem('authToken', response.data.token);
      
      setUser(response.data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabaseApiService.auth.logout();
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

  // 🔐 권한 관리 함수들
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return checkPermission(user.role, permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => checkPermission(user.role, permission));
  }, [user]);

  const hasPageAccess = useCallback((pathname: string): boolean => {
    if (!user) return false;
    return checkPageAccess(user.role, pathname);
  }, [user]);

  const getDataAccess = useCallback((dataType: string): DataAccessLevel => {
    if (!user) return 'none';
    return getDataAccessLevel(user.role, dataType);
  }, [user]);

  const canModifyData = useCallback((dataType: string, dataOwnerId?: string): boolean => {
    if (!user) return false;
    return checkDataModification(user.role, dataType, dataOwnerId, user.id);
  }, [user]);

  // 역할별 편의 함수들
  const isAdmin = user?.role === 'admin';
  const isReception = user?.role === 'reception';
  const isFitness = user?.role === 'fitness';
  const isTennis = user?.role === 'tennis';
  const isGolf = user?.role === 'golf';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      hasPermission,
      hasAnyPermission,
      hasPageAccess,
      getDataAccess,
      canModifyData,
      isAdmin,
      isReception,
      isFitness,
      isTennis,
      isGolf,
      changePassword,
      validateSession,
      refreshUserSession
    }}>
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