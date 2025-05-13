import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { MemberProvider } from "./contexts/MemberContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { TaskProvider } from "./contexts/TaskContext";
import { SuggestionProvider } from "./contexts/SuggestionContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import MainLayout from "./layouts/MainLayout";
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
import { Navigate } from "react-router-dom";

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
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="members" element={<MemberList />} />
                      <Route path="my-tasks" element={<MyTasks />} />
                      <Route path="all-tasks" element={<AllTasks />} />
                      <Route path="daily-report" element={<DailyReport />} />
                      <Route path="suggestions" element={<Suggestions />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="admin/staff" element={<StaffManagement />} />
                      <Route path="admin/tasks" element={<AdminTaskManagement />} />
                      <Route path="admin/announcements" element={<AnnouncementsManagement />} />
                      <Route path="admin/suggestions" element={<AdminSuggestionsManagement />} />
                      <Route path="customer/list" element={<CustomerList />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
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
