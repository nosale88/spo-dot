import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff' | 'trainer' | 'client' | 'user';
  requiredPermission?: string;
}

const ProtectedRoute = ({ children, requiredRole, requiredPermission }: ProtectedRouteProps) => {
  const { user, isAdmin, hasPermission } = useAuth();
  const location = useLocation();

  // 로그인하지 않은 경우 리디렉션
  if (!user) {
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