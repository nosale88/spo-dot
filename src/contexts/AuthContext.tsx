import { ReactNode, createContext, useContext } from "react";

// 간단한 관리자 사용자 제공
const adminUser = {
  id: "admin01",
  email: "admin@example.com",
  name: "관리자",
  role: "admin",
  profileImage: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=Admin"
};

// AuthContext 타입 정의
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

// 기본 Context 생성
const AuthContext = createContext<AuthContextProps>({
  user: adminUser,
  isAdmin: true,
  loading: false,
  login: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => ({ error: null }),
  updatePassword: async () => ({ error: null })
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // 관리자 사용자 정보를 로컬 스토리지에 저장
  if (!localStorage.getItem('user')) {
    localStorage.setItem('user', JSON.stringify(adminUser));
  }
  
  return (
    <AuthContext.Provider value={{
      user: adminUser,
      isAdmin: true,
      loading: false,
      login: async () => ({ error: null }),
      logout: async () => {},
      updateProfile: async () => ({ error: null }),
      updatePassword: async () => ({ error: null })
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 