import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// 사용자 역할 타입
export type UserRole = 'admin' | 'trainer' | 'staff';

// 사용자 정보 타입
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

// 인증 컨텍스트 타입
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// 기본값 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
});

// 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);

// 임시 사용자 데이터 (실제 구현에서는 API 연동 필요)
const MOCK_USERS = [
  {
    id: '1',
    name: '관리자',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    profileImage: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: '트레이너 김철수',
    email: 'trainer@example.com',
    password: 'password123',
    role: 'trainer' as UserRole,
    profileImage: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: '직원 이영희',
    email: 'staff@example.com',
    password: 'password123',
    role: 'staff' as UserRole,
    profileImage: 'https://i.pravatar.cc/150?img=3',
  },
];

// 인증 제공자 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 세션 체크 (로컬스토리지 사용)
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      // 실제 API 요청 대신 임시 데이터 사용
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  // 회원가입 함수
  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      // 이메일 중복 체크
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('이미 사용 중인 이메일입니다.');
      }
      
      // 실제 구현에서는 API 요청을 통한 회원가입 처리 필요
      alert('회원가입 완료! 관리자 승인 후 로그인 가능합니다.');
      navigate('/login');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};