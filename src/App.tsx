import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { MemberProvider } from "./contexts/MemberContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { TaskProvider } from "./contexts/TaskContext";
import { SuggestionProvider } from "./contexts/SuggestionContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { OTProvider } from "./contexts/OTContext";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { ReportProvider } from "./contexts/ReportContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MemberList from "./pages/members/MemberList";
import MyTasks from "./pages/MyTasks";
import AllTasks from "./pages/AllTasks";
import DailyReport from "./pages/DailyReport";
import Suggestions from "./pages/Suggestions";
import Profile from "./pages/Profile";
import StaffManagement from "./pages/admin/StaffManagement";
import AdminTaskManagement from "./pages/admin/TaskManagement";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import AdminSuggestionsManagement from "./pages/admin/SuggestionsManagement";
import CustomerList from "./pages/customer/CustomerList";
import Clients from "./pages/Clients";
import SalesReport from "./pages/SalesReport";
import SalesReportUser from "./pages/SalesReportUser";
import SalesEntry from "./pages/SalesEntry";
import PassManagement from "./pages/PassManagement";
import OtAssignment from "./pages/OtAssignment";
import VendingSales from "./pages/VendingSales";
import Announcements from "./pages/Announcements";
import Manuals from "./pages/Manuals";
import Schedule from "./pages/Schedule";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { NotificationProvider } from './contexts/NotificationContext';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import SalesReportCreate from "./pages/SalesReportCreate";
import ReportManagement from "./pages/admin/ReportManagement";

function App() {
  // 🚀 자동 알림 스케줄러 활성화
  useNotificationScheduler();

  return (
    <AuthProvider>
      <NotificationProvider>
        <UserProvider>
          <MemberProvider>
            <AnnouncementProvider>
              <TaskProvider>
                <SuggestionProvider>
                  <CustomerProvider>
                    <OTProvider>
                      <ScheduleProvider>
                        <ReportProvider>
                        <Routes>
                        {/* 루트 페이지 리디렉션 */}
                        <Route path="/" element={<Navigate to="/auth/login" replace />} />
                        
                        {/* 인증 관련 경로 */}
                        <Route path="/auth" element={<AuthLayout />}>
                          <Route index element={<Navigate to="/auth/login" replace />} />
                          <Route path="login" element={<Login />} />
                          <Route path="register" element={<Register />} />
                        </Route>
                        
                        {/* 메인 애플리케이션 경로 */}
                        <Route 
                          path="/dashboard/*" 
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Dashboard />} />
                          
                          {/* 회원 관리 - 부서 이상 권한 */}
                          <Route 
                            path="members" 
                            element={
                              <ProtectedRoute requiredPermission={['members.view_all', 'members.view_department']}>
                                <MemberList />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 내 업무 - 모든 사용자 */}
                          <Route 
                            path="my-tasks" 
                            element={
                              <ProtectedRoute requiredPermission={['tasks.view_assigned', 'tasks.view_own']}>
                                <MyTasks />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 팀 업무 - 부서 이상 권한 */}
                          <Route 
                            path="all-tasks" 
                            element={
                              <ProtectedRoute requiredPermission={['tasks.view_all', 'tasks.view_department']}>
                                <AllTasks />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 일정 관리 - 일정 권한 */}
                          <Route 
                            path="schedules" 
                            element={
                              <ProtectedRoute requiredPermission={['schedules.view_all', 'schedules.view_department', 'schedules.view_own']}>
                                <Schedule />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 일일 보고서 - 보고서 작성 권한 */}
                          <Route 
                            path="daily-report" 
                            element={
                              <ProtectedRoute requiredPermission="reports.create">
                                <DailyReport />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 건의사항 - 모든 사용자 */}
                          <Route path="suggestions" element={<Suggestions />} />
                          
                          {/* 프로필 - 모든 사용자 */}
                          <Route path="profile" element={<Profile />} />
                          
                          {/* 공지사항 - 모든 사용자 */}
                          <Route path="announcements" element={<Announcements />} />
                          
                          {/* 매뉴얼 - 모든 사용자 */}
                          <Route path="manuals" element={<Manuals />} />
                          
                          {/* 관리자 전용 경로 */}
                          <Route 
                            path="admin/staff" 
                            element={
                              <ProtectedRoute 
                                requiredRole="admin" 
                                requiredPermission="users.view_all"
                              >
                                <StaffManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="admin/tasks" 
                            element={
                              <ProtectedRoute 
                                requiredRole="admin"
                                requiredPermission={['tasks.view_all', 'tasks.assign']}
                              >
                                <AdminTaskManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="admin/announcements" 
                            element={
                              <ProtectedRoute 
                                requiredRole="admin"
                                requiredPermission="announcements.create"
                              >
                                <AnnouncementsManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="admin/suggestions" 
                            element={
                              <ProtectedRoute 
                                requiredRole="admin"
                                requiredPermission="admin.dashboard"
                              >
                                <AdminSuggestionsManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="admin/reports" 
                            element={
                              <ProtectedRoute 
                                requiredRole="admin"
                                requiredPermission="admin.dashboard"
                              >
                                <ReportManagement />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 운영팀 전용 경로 */}
                          <Route 
                            path="customer/list" 
                            element={
                              <ProtectedRoute 
                                requiredRole={['admin', 'reception']}
                                requiredPermission="members.view_all"
                              >
                                <Clients />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 매출 관련 라우트 */}
                          <Route 
                            path="sales-report" 
                            element={
                              <ProtectedRoute requiredPermission="sales.view_all">
                                <SalesReport />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="sales-report-user" 
                            element={
                              <ProtectedRoute requiredPermission="sales.view_own">
                                <SalesReportUser />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="sales-entry" 
                            element={
                              <ProtectedRoute requiredPermission="sales.create">
                                <SalesEntry />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="sales-report-create" 
                            element={
                              <ProtectedRoute requiredPermission={['reports.create', 'sales.view_department', 'sales.view_own']}>
                                <SalesReportCreate />
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* 운영팀 기능들 */}
                          <Route 
                            path="pass-management" 
                            element={
                              <ProtectedRoute requiredRole={['admin', 'reception']}>
                                <PassManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="ot-assignment" 
                            element={
                              <ProtectedRoute requiredRole={['admin', 'reception']}>
                                <OtAssignment />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="vending-sales" 
                            element={
                              <ProtectedRoute requiredPermission="sales.create">
                                <VendingSales />
                              </ProtectedRoute>
                            } 
                          />
                        </Route>
                        
                        {/* 알 수 없는 경로 */}
                        <Route path="*" element={<Navigate to="/auth/login" replace />} />
                      </Routes>
                        </ReportProvider>
                      </ScheduleProvider>
                    </OTProvider>
                  </CustomerProvider>
                </SuggestionProvider>
              </TaskProvider>
            </AnnouncementProvider>
          </MemberProvider>
        </UserProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
