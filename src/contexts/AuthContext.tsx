import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

// AuthContext 타입 정의
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  profileImage?: string;
  department?: string;
  position?: string;
  permissions?: string[];
}

interface AuthContextProps {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<{ error: Error | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  checkAuth: () => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<{ error: Error | null, user: User | null }>;
  hasPermission: (permission: string) => boolean;
}

// 기본 Context 생성
const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  checkAuth: async () => false,
  register: async () => ({ error: null, user: null }),
  hasPermission: () => false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 인증 상태 확인
  const checkAuth = async (): Promise<boolean> => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return false;
      
      const userData = JSON.parse(storedUser);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('사용자 인증 확인 중 오류:', err);
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  // 앱 로드 시 사용자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // 로컬 스토리지에서 사용자 정보 확인
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          // 직접 사용자 정보 설정
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ 사용자 로그인 상태 복원됨:', userData.name);
        }
      } catch (err) {
        console.error('❌ 초기 인증 로드 오류:', err);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Supabase에서 사용자 확인
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) {
        console.error('로그인 오류:', error);
        return { error: new Error('로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.') };
      }

      if (data) {
        // 사용자 정보 설정
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          profileImage: data.profile_image,
          department: data.department,
          position: data.position,
          permissions: data.permissions
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 마지막 로그인 시간 업데이트
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
          
        return { error: null };
      } else {
        return { error: new Error('로그인 실패: 사용자를 찾을 수 없습니다.') };
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // 이메일 중복 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (existingUser) {
        return { 
          error: new Error('이미 사용 중인 이메일입니다.'), 
          user: null 
        };
      }
      
      // 새 사용자 추가
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password,
            name,
            role: 'user', // 기본 역할
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) {
        console.error('회원가입 오류:', error);
        return { 
          error: new Error('회원가입 실패: ' + error.message), 
          user: null 
        };
      }
      
      if (data && data.length > 0) {
        const userData = {
          id: data[0].id,
          email: data[0].email,
          name: data[0].name,
          role: data[0].role
        };
        
        return { 
          error: null, 
          user: userData 
        };
      }
      
      return { 
        error: new Error('회원가입 실패: 알 수 없는 오류'), 
        user: null 
      };
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      return { 
        error: error as Error,
        user: null 
      };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    // 로그인 페이지로 리디렉션
    window.location.href = '/auth/login';
  };

  // 프로필 업데이트 함수
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user) {
        return { error: new Error('로그인된 사용자가 없습니다.') };
      }

      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          email: profileData.email,
          profile_image: profileData.profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('프로필 업데이트 오류:', error);
        return { error: new Error('프로필 업데이트 실패') };
      }

      // 로컬 상태 업데이트
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      if (user) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...profileData }));
      }
      return { error: null };
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      return { error: error as Error };
    }
  };

  // 비밀번호 변경 함수
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        return { error: new Error('로그인된 사용자가 없습니다.') };
      }

      // 현재 비밀번호 확인
      const { data } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();

      if (data?.password !== currentPassword) {
        return { error: new Error('현재 비밀번호가 일치하지 않습니다.') };
      }

      // 비밀번호 업데이트
      const { error } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('비밀번호 변경 오류:', error);
        return { error: new Error('비밀번호 변경 실패') };
      }

      return { error: null };
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      return { error: error as Error };
    }
  };
  
  // 권한 확인 함수
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // 관리자는 모든 권한을 가짐
    if (user.role === 'admin') return true;
    
    // 권한 배열이 있는지 확인하고 권한 포함 여부 체크
    return user.permissions ? user.permissions.includes(permission) : false;
  };

  // 현재 사용자가 관리자인지 확인
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      login,
      logout,
      updateProfile,
      updatePassword,
      checkAuth,
      register,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 