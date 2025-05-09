import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { MemberProvider } from './contexts/MemberContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import { TaskProvider } from './contexts/TaskContext';
import { SuggestionProvider } from './contexts/SuggestionContext'; 
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import MemberList from './pages/members/MemberList';
import MyTasks from './pages/MyTasks';
import AllTasks from './pages/AllTasks';
import DailyReport from './pages/DailyReport';
import Suggestions from './pages/Suggestions';
import Profile from './pages/Profile';
import StaffManagement from './pages/admin/StaffManagement';
import AdminTaskManagement from './pages/admin/TaskManagement';
import AnnouncementsManagement from './pages/admin/AnnouncementsManagement';
import AdminSuggestionsManagement from './pages/admin/SuggestionsManagement';

// PrivateRoute 컴포넌트
const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  if (auth === undefined) {
    return <Navigate to="/login" replace />;
  }
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  // children이 있으면 children을, 없으면 Outlet을 렌더링 (React Router v6 Outlet 컨벤션 지원)
  return children ? <>{children}</> : <Outlet />;
};

// AdminRoute 컴포넌트
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  if (auth === undefined || !auth.user) {
    return <Navigate to="/login" replace />;
  }
  if (auth.user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />; 
  }
  return <>{children}</>; // children을 직접 렌더링
};

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <MemberProvider>
          <AnnouncementProvider>
            <TaskProvider>
              <SuggestionProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  {/* 보호된 경로들 */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                      {/* MainLayout의 Outlet을 통해 렌더링될 경로들 */}
                      <Route index element={<Navigate to="dashboard" replace />} /> {/* '/' 접근 시 'dashboard'로 */}
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="members" element={<MemberList />} />
                      <Route path="my-tasks" element={<MyTasks />} />
                      <Route path="all-tasks" element={<AllTasks />} />
                      <Route path="daily-report" element={<DailyReport />} />
                      <Route path="suggestions" element={<Suggestions />} />
                      <Route path="profile" element={<Profile />} />
                      <Route 
                        path="admin/staff-management" 
                        element={
                          <AdminRoute>
                            <StaffManagement />
                          </AdminRoute>
                        }
                      />
                      <Route 
                        path="admin/tasks" 
                        element={
                          <AdminRoute>
                            <AdminTaskManagement />
                          </AdminRoute>
                        }
                      />
                      <Route 
                        path="admin/suggestions-management" 
                        element={
                          <AdminRoute>
                            <AdminSuggestionsManagement />
                          </AdminRoute>
                        }
                      />
                      <Route 
                        path="admin/announcements" 
                        element={
                          <AdminRoute>
                            <AnnouncementsManagement />
                          </AdminRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} /> {/* MainLayout 내 잘못된 경로 처리 */}
                    </Route>
                  </Route>

                  {/* 최상위 레벨에서 일치하는 경로가 없을 때 (예: /login 외의 public 경로가 없으므로 거의 발생 안함) */}
                  <Route path="*" element={<NotFound />} /> 
                </Routes>
              </SuggestionProvider>
            </TaskProvider>
          </AnnouncementProvider>
        </MemberProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;