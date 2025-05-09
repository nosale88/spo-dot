import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'trainer' | 'staff';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때는 로딩 화면 보여줌
  if (loading) {
    return <LoadingScreen />;
  }

  // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 특정 역할이 필요한 페이지인 경우 역할 확인
  if (requiredRole && user.role !== requiredRole) {
    // 관리자 페이지인 경우 대시보드로 리다이렉트
    if (requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;