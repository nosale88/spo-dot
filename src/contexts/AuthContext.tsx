import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  profileImage?: string;
}

interface AuthContextProps {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<{ error: Error | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 불러오기 (개발용 더미 데이터)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
    setLoading(false);
  }, []);

  const DUMMY_USERS = [
    {
      id: 'spodot',
      email: 'spodot@naver.com',
      password: 'gmjgdy0611@',
      name: '스포닷 관리자',
      role: 'admin',
      profileImage: 'https://via.placeholder.com/150/FF6347/FFFFFF?Text=SpodotAdmin'
    },
    {
      id: 'admin01',
      email: 'admin@example.com',
      password: 'password123',
      name: '기존 관리자',
      role: 'admin',
      profileImage: 'https://via.placeholder.com/150/0000FF/FFFFFF?Text=Admin'
    },
    {
      id: 'trainer01',
      email: 'trainer@example.com',
      password: 'password123',
      name: '김트레이너',
      role: 'trainer',
      profileImage: 'https://via.placeholder.com/150/32CD32/FFFFFF?Text=Trainer'
    },
    {
      id: 'staff01',
      email: 'staff@example.com',
      password: 'password123',
      name: '이직원',
      role: 'staff',
      profileImage: 'https://via.placeholder.com/150/FFD700/000000?Text=Staff'
    }
  ];

  const login = async (email: string, password: string) => {
    const foundUser = DUMMY_USERS.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const userToStore: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        profileImage: foundUser.profileImage,
      };
      setUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      return { error: null };
    }

    return { error: new Error('이메일 또는 비밀번호가 잘못되었습니다.') };
  };

  const logout = async () => {
    // await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  // 프로필 정보 업데이트 함수
  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    try {
      // 실제 구현에서는 API 호출 필요
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { error: null };
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return { error: new Error('프로필 업데이트 중 오류가 발생했습니다.') };
    }
  };

  // 비밀번호 변경 함수
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    try {
      // 더미 데이터에서 사용자 찾기
      const foundUser = DUMMY_USERS.find(u => u.id === user.id && u.password === currentPassword);
      
      if (!foundUser) {
        return { error: new Error('현재 비밀번호가 일치하지 않습니다.') };
      }

      // 실제 구현에서는 API 호출 필요
      // 여기서는 더미 데이터만 수정 (실제로는 효과 없음)
      foundUser.password = newPassword;
      
      return { error: null };
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      return { error: new Error('비밀번호 변경 중 오류가 발생했습니다.') };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      login, 
      logout,
      updateProfile,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다');
  }
  return context;
}

// No need to re-export AuthProvider as it's already exported above
