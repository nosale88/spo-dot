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
                                          {/* 인증 경로 */}
                                          <Route path="/auth" element={<AuthLayout />}>
                                            <Route path="login" element={<Login />} />
                                            <Route path="register" element={<Register />} />
                                          </Route>

                                          {/* 보호된 메인 경로 */}
                                          <Route
                                            path="/*"
                                            element={
                                              <ProtectedRoute>
                                                <MainLayout />
                                              </ProtectedRoute>
                                            }
                                          >
                                            {/* 대시보드 */}
                                            <Route index element={<Dashboard />} />
                                            <Route path="dashboard" element={<Dashboard />} />

                                            {/* 업무 관리 */}
                                            <Route path="my-tasks" element={<MyTasks />} />
                                            <Route path="all-tasks" element={<AllTasks />} />

                                            {/* 일정 관리 */}
                                            <Route path="schedule" element={<Schedule />} />

                                            {/* 보고서 */}
                                            <Route path="daily-report" element={<DailyReport />} />
                                            <Route path="reports" element={<Reports />} />
                                            <Route path="work-reports" element={<WorkReports />} />

                                            {/* 공지사항 */}
                                            <Route path="announcements" element={<Announcements />} />

                                            {/* 건의사항 */}
                                            <Route path="suggestions" element={<Suggestions />} />

                                            {/* 프로필 */}
                                            <Route path="profile" element={<Profile />} />

                                            {/* 회원/고객 관리 */}
                                            <Route path="members" element={<MemberList />} />
                                            <Route path="customers" element={<CustomerList />} />
                                            <Route path="clients" element={<Clients />} />
                                            <Route path="trainers" element={<Trainers />} />

                                            {/* 매뉴얼 */}
                                            <Route path="manuals" element={<Manuals />} />

                                            {/* 매출 관리 */}
                                            <Route path="sales-entry" element={<SalesEntry />} />
                                            <Route path="sales-report" element={<SalesReport />} />
                                            <Route path="sales-report-user" element={<SalesReportUser />} />
                                            <Route path="sales-report-create" element={<SalesReportCreate />} />

                                            {/* 기타 관리 */}
                                            <Route path="pass-management" element={<PassManagement />} />
                                            <Route path="vending-sales" element={<VendingSales />} />
                                            <Route path="ot-assignment" element={<OtAssignment />} />

                                            {/* 관리자 페이지 */}
                                            <Route path="admin" element={<AdminDashboard />} />
                                            <Route path="admin/staff" element={<StaffManagement />} />
                                            <Route path="admin/tasks" element={<TaskManagement />} />
                                            <Route path="admin/reports" element={<ReportManagement />} />
                                            <Route path="admin/announcements" element={<AnnouncementsManagement />} />
                                            <Route path="admin/suggestions" element={<SuggestionsManagement />} />
                                            <Route path="admin/settings" element={<AdminSettings />} />
                                          </Route>

                                          {/* 404 페이지 */}
                                          <Route path="*" element={<NotFound />} />
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
  );
}
