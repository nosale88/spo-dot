<<<<<<< HEAD
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
import DailyReportManagement from "./pages/admin/DailyReportManagement";
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
import Toast from './components/common/Toast';
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalDataProvider } from './contexts/GlobalDataContext';
import { UserProvider } from './contexts/UserContext';
import { TaskProvider } from './contexts/TaskContext';
import { ReportProvider } from './contexts/ReportContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import { SuggestionProvider } from './contexts/SuggestionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { HandoverProvider } from './contexts/HandoverContext';
import { VendingProvider } from './contexts/VendingContext';
import { OTProvider } from './contexts/OTContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { MemberProvider } from './contexts/MemberContext';
>>>>>>> 44f164cad4e06545f0588bfd7c5302c9923da970

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import { setupGlobalErrorHandling } from './utils/errorHandler';

// Lazy load components for better code splitting
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyTasks = lazy(() => import('./pages/MyTasks'));
const AllTasks = lazy(() => import('./pages/AllTasks'));
const Schedule = lazy(() => import('./pages/Schedule'));
const DailyReport = lazy(() => import('./pages/DailyReport'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Suggestions = lazy(() => import('./pages/Suggestions'));
const Profile = lazy(() => import('./pages/Profile'));
const Clients = lazy(() => import('./pages/Clients'));
const Trainers = lazy(() => import('./pages/Trainers'));
const Manuals = lazy(() => import('./pages/Manuals'));
const SalesEntry = lazy(() => import('./pages/SalesEntry'));
const PassManagement = lazy(() => import('./pages/PassManagement'));
const VendingSales = lazy(() => import('./pages/VendingSales'));
const OtAssignment = lazy(() => import('./pages/OtAssignment'));
const Reports = lazy(() => import('./pages/Reports'));
const SalesReport = lazy(() => import('./pages/SalesReport'));
const SalesReportUser = lazy(() => import('./pages/SalesReportUser'));
const SalesReportCreate = lazy(() => import('./pages/SalesReportCreate'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const TaskManagement = lazy(() => import('./pages/admin/TaskManagement'));
const ReportManagement = lazy(() => import('./pages/admin/ReportManagement'));
const AnnouncementsManagement = lazy(() => import('./pages/admin/AnnouncementsManagement'));
const SuggestionsManagement = lazy(() => import('./pages/admin/SuggestionsManagement'));

// Member/Customer pages
const MemberList = lazy(() => import('./pages/members/MemberList'));
const CustomerList = lazy(() => import('./pages/customer/CustomerList'));
const WorkReports = lazy(() => import('./pages/reports/WorkReports'));

// 전역 에러 핸들링 설정
setupGlobalErrorHandling();

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <GlobalDataProvider>
            <UserProvider>
              <TaskProvider>
<<<<<<< HEAD
                <SuggestionProvider>
                  <CustomerProvider>
                    <OTProvider>
                      <ScheduleProvider>
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
                            path="admin/daily-reports" 
                            element={
                              <ProtectedRoute 
                                requiredRole="admin"
                                requiredPermission="reports.view_all"
                              >
                                <DailyReportManagement />
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
                      </ScheduleProvider>
                    </OTProvider>
                  </CustomerProvider>
                </SuggestionProvider>
              </TaskProvider>
            </AnnouncementProvider>
          </MemberProvider>
        </UserProvider>
        <Toast />
      </NotificationProvider>
    </AuthProvider>
=======
                <ReportProvider>
                  <AnnouncementProvider>
                    <SuggestionProvider>
                      <NotificationProvider>
                        <RealtimeProvider>
                          <ScheduleProvider>
                            <HandoverProvider>
                              <VendingProvider>
                                <OTProvider>
                                  <CustomerProvider>
                                    <MemberProvider>
                                      <Suspense fallback={<LoadingScreen />}>
                                        <Routes>
                                          {/* 인증 관련 라우트 */}
                                          <Route path="/auth" element={<AuthLayout />}>
                                            <Route path="login" element={<Login />} />
                                            <Route path="register" element={<Register />} />
                                          </Route>

                                          {/* 메인 애플리케이션 라우트 */}
                                          <Route
                                            path="/*"
                                            element={
                                              <ProtectedRoute>
                                                <MainLayout />
                                              </ProtectedRoute>
                                            }
                                          >
                                            <Route index element={<Dashboard />} />
                                            <Route path="dashboard" element={<Dashboard />} />
                                            <Route path="my-tasks" element={<MyTasks />} />
                                            <Route path="all-tasks" element={<AllTasks />} />
                                            <Route path="schedule" element={<Schedule />} />
                                            <Route path="daily-report" element={<DailyReport />} />
                                            <Route path="announcements" element={<Announcements />} />
                                            <Route path="suggestions" element={<Suggestions />} />
                                            <Route path="profile" element={<Profile />} />
                                                                                         <Route path="clients" element={<Clients />} />
                                             <Route path="trainers" element={<Trainers />} />
                                             <Route path="manuals" element={<Manuals />} />
                                            <Route path="sales-entry" element={<SalesEntry />} />
                                            <Route path="pass-management" element={<PassManagement />} />
                                            <Route path="vending-sales" element={<VendingSales />} />
                                            <Route path="ot-assignment" element={<OtAssignment />} />
                                            <Route path="reports" element={<Reports />} />
                                            <Route path="sales-report" element={<SalesReport />} />
                                            <Route path="sales-report-user" element={<SalesReportUser />} />
                                            <Route path="sales-report-create" element={<SalesReportCreate />} />
                                            <Route path="admin-settings" element={<AdminSettings />} />

                                            {/* 관리자 라우트 */}
                                            <Route path="admin/dashboard" element={<AdminDashboard />} />
                                            <Route path="admin/staff" element={<StaffManagement />} />
                                            <Route path="admin/tasks" element={<TaskManagement />} />
                                            <Route path="admin/reports" element={<ReportManagement />} />
                                            <Route path="admin/announcements" element={<AnnouncementsManagement />} />
                                            <Route path="admin/suggestions" element={<SuggestionsManagement />} />

                                            {/* 회원/고객 관리 */}
                                            <Route path="members" element={<MemberList />} />
                                            <Route path="customers" element={<CustomerList />} />
                                            <Route path="work-reports" element={<WorkReports />} />

                                            {/* 404 페이지 */}
                                            <Route path="*" element={<NotFound />} />
                                          </Route>
                                        </Routes>
                                      </Suspense>
                                    </MemberProvider>
                                  </CustomerProvider>
                                </OTProvider>
                              </VendingProvider>
                            </HandoverProvider>
                          </ScheduleProvider>
                        </RealtimeProvider>
                      </NotificationProvider>
                    </SuggestionProvider>
                  </AnnouncementProvider>
                </ReportProvider>
              </TaskProvider>
            </UserProvider>
          </GlobalDataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
>>>>>>> 44f164cad4e06545f0588bfd7c5302c9923da970
  );
}
