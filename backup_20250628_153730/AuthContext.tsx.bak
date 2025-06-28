import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabaseApiService } from '../services/supabaseApi';
import { 
  UserRole, 
  Permission, 
  hasPermission as checkPermission, 
  hasPageAccess as checkPageAccess,
  getDataAccessLevel,
  canModifyData as checkDataModification,
  DataAccessLevel
} from '../types/permissions';

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
        const currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
          const userData = await supabaseApiService.auth.getCurrentUser();
          setUser(userData);
          console.log('✅ 사용자 인증 확인:', userData.role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUserName');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await supabaseApiService.auth.login({ email, password });
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('currentUserId', response.user.id);
      localStorage.setItem('currentUserName', response.user.name);
      localStorage.setItem('authToken', response.token);
      
      setUser(response.user);
      console.log('✅ 로그인 성공:', response.user.role);
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
      isGolf
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