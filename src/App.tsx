import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { MemberProvider } from "./contexts/MemberContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { TaskProvider } from "./contexts/TaskContext";
import { SuggestionProvider } from "./contexts/SuggestionContext";
import { CustomerProvider } from "./contexts/CustomerContext";
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
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <MemberProvider>
          <AnnouncementProvider>
            <TaskProvider>
              <SuggestionProvider>
                <CustomerProvider>
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
                      <Route path="members" element={<MemberList />} />
                      <Route path="my-tasks" element={<MyTasks />} />
                      <Route path="all-tasks" element={<AllTasks />} />
                      <Route path="daily-report" element={<DailyReport />} />
                      <Route path="suggestions" element={<Suggestions />} />
                      <Route path="profile" element={<Profile />} />
                      
                      {/* 관리자 전용 경로 */}
                      <Route 
                        path="admin/staff" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <StaffManagement />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/tasks" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminTaskManagement />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/announcements" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AnnouncementsManagement />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/suggestions" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminSuggestionsManagement />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* 고객 관리 라우트 */}
                      <Route 
                        path="customer/list" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <Clients />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="sales-report" element={<SalesReport />} />
                      <Route path="sales-report-user" element={<SalesReportUser />} />
                      <Route path="sales-entry" element={<SalesEntry />} />
                      <Route path="pass-management" element={<PassManagement />} />
                      <Route path="ot-assignment" element={<OtAssignment />} />
                      <Route path="vending-sales" element={<VendingSales />} />
                    </Route>
                    
                    {/* 알 수 없는 경로 */}
                    <Route path="*" element={<Navigate to="/auth/login" replace />} />
                  </Routes>
                </CustomerProvider>
              </SuggestionProvider>
            </TaskProvider>
          </AnnouncementProvider>
        </MemberProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
