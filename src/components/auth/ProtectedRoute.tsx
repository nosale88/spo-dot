import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Permission, UserRole } from '../../types/permissions';
import { ShieldX, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission | Permission[];
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallbackPath = '/dashboard',
  showUnauthorized = false
}) => {
  const { user, hasPermission, hasPageAccess, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 페이지별 권한 검사 (자동)
  if (!hasPageAccess(location.pathname)) {
    
    if (showUnauthorized) {
      return <UnauthorizedComponent />;
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  // 역할 체크 (배열 지원)
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      
      if (showUnauthorized) {
        return <UnauthorizedComponent />;
      }
      
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // 권한 체크 (배열 지원 - OR 조건)
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const hasAnyPermission = permissions.some(permission => hasPermission(permission));
    
    if (!hasAnyPermission) {
      
      if (showUnauthorized) {
        return <UnauthorizedComponent />;
      }
      
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

// 권한 없음 컴포넌트
const UnauthorizedComponent = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-slate-600 mb-6">
            현재 사용자 권한({user?.role})으로는 이 페이지에 접근할 수 없습니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              이전 페이지로 돌아가기
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;