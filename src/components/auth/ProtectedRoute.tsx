import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff' | 'trainer' | 'client' | 'user';
  requiredPermission?: string;
}

const ProtectedRoute = ({ children, requiredRole, requiredPermission }: ProtectedRouteProps) => {
  const { user, isAdmin, hasPermission, loading } = useAuth();
  const location = useLocation();

  // 디버깅용 로그 (조건부)
  if (!user && !loading) {
    console.log('❌ ProtectedRoute: 사용자 없음, 경로:', location.pathname);
  } else if (user && !loading) {
    console.log('✅ ProtectedRoute: 사용자 인증됨, 경로:', location.pathname);
  }

  // 로딩 중일 때는 로딩 화면 표시
  if (loading) {
    console.log('⏳ ProtectedRoute: 로딩 중...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 로그인하지 않은 경우 리디렉션
  if (!user) {
    console.log('❌ ProtectedRoute: 사용자 없음, 로그인 페이지로 리디렉션');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 역할 권한 검사
  if (requiredRole && user.role !== requiredRole) {
    // 관리자는 모든 역할에 접근 가능
    if (user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 특정 권한 검사
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;