import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Team } from '../types';
import { supabase } from '../supabaseClient';

// 사용자 역할 타입
export type UserRole = 'client' | 'trainer' | 'admin' | 'staff';

// 사용자 성별 타입
export type Gender = 'male' | 'female' | 'other';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// 알림 유형 타입
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

// 사용자 기본 인터페이스
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profileImage?: string;
  password?: string;
}

// 고객 인터페이스
export interface Client extends User {
  role: 'client';
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  emergencyContact?: string;
  membershipType?: string;
  membershipStart?: string;
  membershipEnd?: string;
  weight?: number;
  height?: number;
  goals?: string;
  healthNotes?: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
}

// 트레이너 인터페이스
export interface Trainer extends User {
  role: 'trainer';
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  schedule?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  hourlyRate?: number;
  clientCount?: number;
  schedulePreference?: {
    availableDays: string[];
    preferredHours: {
      start: string;
      end: string;
    };
  };
  experience?: string;
}

// 직원 인터페이스
export interface Staff extends User {
  id: string;
  employeeId?: string;
  team?: Team | null;
  position?: string;
  hireDate?: string;
  permissions?: string[];
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profileImage?: string;
}

// 알림 인터페이스
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// 필터 옵션 인터페이스
interface UserFilterOptions {
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  searchQuery?: string;
  trainerId?: string;
}

interface UserContextProps {
  users: User[];
  clients?: Client[];
  trainers?: Trainer[];
  staff?: Staff[];
  filteredUsers?: User[];
  notifications?: Notification[];
  unreadNotificationsCount?: number;
  loadingStaff?: boolean;
  staffError?: Error | null;

  // 필터링
  filterUsers?: (options: UserFilterOptions) => void;

  // CRUD 기능
  addUser?: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateUser?: (id: string, userData: Partial<User>) => void;
  deleteUser?: (id: string) => Promise<boolean>;
  getUserById?: (id: string) => User | undefined;

  // 고객 특정 기능
  addClient?: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'role'>) => string;
  updateClient?: (id: string, clientData: Partial<Client>) => void;
  assignTrainer?: (clientId: string, trainerId: string, trainerName: string) => void;

  // 트레이너 특정 기능
  addTrainer?: (trainer: Omit<Trainer, 'id' | 'createdAt' | 'updatedAt' | 'role'>) => string;
  updateTrainer?: (id: string, trainerData: Partial<Trainer>) => void;
  getTrainerClients?: (trainerId: string) => Client[];

  // 직원 특정 기능
  addStaff?: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updateStaff?: (id: string, staffData: Partial<Staff>) => Promise<boolean>;
  updatePermissions?: (id: string, permissions: string[]) => void;

  // 알림 기능
  createNotification?: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => string;
  markNotificationAsRead?: (notificationId: string) => void;
  markAllNotificationsAsRead?: () => void;
  deleteNotification?: (notificationId: string) => void;
  getUserNotifications?: (userId: string) => Notification[];
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // 초기 일반 사용자 목록 (기존 유지 또는 필요시 동적 관리)
  const initialUsers: User[] = [
    {
      id: 'user-admin-01', // ID 고유성 확보
      name: '관리자 (컨텍스트)',
      email: 'admin@example.com',
      role: 'admin',
      phone: '010-0000-0000',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-trainer-01',
      name: '트레이너 (컨텍스트)',
      email: 'trainer@example.com',
      role: 'trainer',
      phone: '010-1111-1111',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // StaffManagement의 initialStaff와 유사한 초기 직원 데이터 추가
    {
      id: 'user-staff-01',
      name: '홍길동 (컨텍스트)',
      email: 'hong-context@example.com',
      role: 'staff',
      phone: '010-1234-5678',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ];
  const [users, setUsers] = useState<User[]>(initialUsers);

  // 직원(Staff) 목록 상태 관리
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState<Error | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    setStaffError(null);
    try {
      const { data, error } = await supabase
        .from('profiles') 
        .select('*');

      if (error) {
        console.error('Error fetching staff:', error);
        setStaffError(error);
        return;
      }

      if (data) {
        const fetchedStaff = data
          .filter(profile => profile.role === 'staff' || profile.role === 'admin')
          .map(profile => ({
            id: profile.id,
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '', 
            role: profile.role as 'staff' | 'admin',
            status: profile.status as UserStatus || 'active',
            employeeId: profile.employee_id,
            team: profile.team as Team || null,
            position: profile.position,
            hireDate: profile.hire_date,
            permissions: profile.permissions,
            profileImage: profile.profile_image_url,
            createdAt: profile.created_at || new Date().toISOString(),
            updatedAt: profile.updated_at || new Date().toISOString(),
            lastLogin: profile.last_login,
          }));
        setStaffList(fetchedStaff as Staff[]); 
      }
    } catch (err) {
      console.error('Unexpected error fetching staff:', err);
      setStaffError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setLoadingStaff(false);
    }
  };

  // 직원 추가 함수 구현 (Supabase insert)
  const addStaffMember = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    setLoadingStaff(true);
    try {
      const profileData = {
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role,
        status: staffData.status,
        employee_id: staffData.employeeId,
        team: staffData.team,
        position: staffData.position,
        hire_date: staffData.hireDate,
        permissions: staffData.permissions,
        profile_image_url: staffData.profileImage,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select(); 

      if (error) {
        console.error('Error adding staff:', error);
        setStaffError(error);
        setLoadingStaff(false);
        return null;
      }

      if (data && data.length > 0) {
        const newStaffMember = {
            id: data[0].id,
            name: data[0].name || '',
            email: data[0].email || '',
            phone: data[0].phone || '', 
            role: data[0].role as 'staff' | 'admin',
            status: data[0].status as UserStatus || 'active',
            employeeId: data[0].employee_id,
            team: data[0].team as Team || null,
            position: data[0].position,
            hireDate: data[0].hire_date,
            permissions: data[0].permissions,
            profileImage: data[0].profile_image_url,
            createdAt: data[0].created_at || new Date().toISOString(),
            updatedAt: data[0].updated_at || new Date().toISOString(),
            lastLogin: data[0].last_login,
        };
        setStaffList(prevStaffList => [...prevStaffList, newStaffMember as Staff]);
        setLoadingStaff(false);
        return data[0].id; 
      }
      setLoadingStaff(false);
      return null;
    } catch (err) {
      console.error('Unexpected error adding staff:', err);
      setStaffError(err instanceof Error ? err : new Error('An unexpected error occurred while adding staff'));
      setLoadingStaff(false);
      return null;
    }
  };

  // 직원 정보 수정 함수 (Supabase update)
  const updateStaffMember = async (id: string, staffData: Partial<Staff>): Promise<boolean> => {
    setLoadingStaff(true);
    try {
      // Map partial Staff data to Supabase 'profiles' table columns (snake_case)
      const profileUpdateData: { [key: string]: any } = {};
      if (staffData.name !== undefined) profileUpdateData.name = staffData.name;
      if (staffData.email !== undefined) profileUpdateData.email = staffData.email;
      if (staffData.phone !== undefined) profileUpdateData.phone = staffData.phone;
      if (staffData.role !== undefined) profileUpdateData.role = staffData.role;
      if (staffData.status !== undefined) profileUpdateData.status = staffData.status;
      if (staffData.employeeId !== undefined) profileUpdateData.employee_id = staffData.employeeId;
      if (staffData.team !== undefined) profileUpdateData.team = staffData.team;
      if (staffData.position !== undefined) profileUpdateData.position = staffData.position;
      if (staffData.hireDate !== undefined) profileUpdateData.hire_date = staffData.hireDate;
      if (staffData.permissions !== undefined) profileUpdateData.permissions = staffData.permissions;
      if (staffData.profileImage !== undefined) profileUpdateData.profile_image_url = staffData.profileImage;
      // updated_at will be handled by Supabase or a DB trigger

      if (Object.keys(profileUpdateData).length === 0) {
        setLoadingStaff(false);
        return true; // No data to update
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating staff:', error);
        setStaffError(error);
        setLoadingStaff(false);
        return false;
      }

      if (data && data.length > 0) {
        // Update the local state
        const updatedStaffMember = {
            id: data[0].id,
            name: data[0].name || '',
            email: data[0].email || '',
            phone: data[0].phone || '', 
            role: data[0].role as 'staff' | 'admin',
            status: data[0].status as UserStatus || 'active',
            employeeId: data[0].employee_id,
            team: data[0].team as Team || null,
            position: data[0].position,
            hireDate: data[0].hire_date,
            permissions: data[0].permissions,
            profileImage: data[0].profile_image_url,
            createdAt: data[0].created_at || new Date().toISOString(),
            updatedAt: data[0].updated_at || new Date().toISOString(),
            lastLogin: data[0].last_login,
        };
        setStaffList(prevStaffList => 
          prevStaffList.map(staff => staff.id === id ? (updatedStaffMember as Staff) : staff)
        );
        setLoadingStaff(false);
        return true;
      }
      setLoadingStaff(false);
      return false; // Should not happen if update was successful and select returned data
    } catch (err) {
      console.error('Unexpected error updating staff:', err);
      setStaffError(err instanceof Error ? err : new Error('An unexpected error occurred while updating staff'));
      setLoadingStaff(false);
      return false;
    }
  };

  // 직원 삭제 함수 (Supabase delete)
  const deleteStaffMember = async (id: string): Promise<boolean> => {
    setLoadingStaff(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting staff:', error);
        setStaffError(error);
        setLoadingStaff(false);
        return false;
      }

      // Remove the staff member from the local state
      setStaffList(prevStaffList => prevStaffList.filter(staff => staff.id !== id));
      setLoadingStaff(false);
      return true;
    } catch (err) {
      console.error('Unexpected error deleting staff:', err);
      setStaffError(err instanceof Error ? err : new Error('An unexpected error occurred while deleting staff'));
      setLoadingStaff(false);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{
      users, 
      staff: staffList, 
      loadingStaff,
      staffError,
      addStaff: addStaffMember, 
      updateStaff: updateStaffMember, 
      deleteUser: deleteStaffMember, 
      clients: [], 
      trainers: [],
      filteredUsers: users,
      notifications: [],
      unreadNotificationsCount: 0,
      filterUsers: (options) => console.log('Filter users by:', options),
      addUser: (userData) => {
        const newUserId = `user-${Date.now()}`;
        const newUser: User = { ...userData, id: newUserId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setUsers(prev => [...prev, newUser]);
        return newUserId;
      },
      updateUser: (id, userData) => {
        setUsers(prevUsers =>
          prevUsers.map(user => user.id === id ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user)
        );
      },
      getUserById: (id) => users.find(u => u.id === id) || staffList.find(s => s.id === id),
      addClient: (clientData) => { console.log('Add client:', clientData); return 'new-client-id'; },
      updateClient: (id, clientData) => console.log('Update client:', id, clientData),
      assignTrainer: (clientId, trainerId, trainerName) => console.log('Assign trainer:', clientId, trainerId, trainerName),
      addTrainer: (trainerData) => { console.log('Add trainer:', trainerData); return 'new-trainer-id'; },
      updateTrainer: (id, trainerData) => console.log('Update trainer:', id, trainerData),
      getTrainerClients: (trainerId) => { console.log('Get trainer clients:', trainerId); return []; },
      updatePermissions: (id, permissions) => {
        updateStaffMember(id, { permissions });
        console.log('Update permissions:', id, permissions);
      },
      createNotification: (notificationData) => { console.log('Create notification:', notificationData); return 'new-notification-id'; },
      markNotificationAsRead: (notificationId) => console.log('Mark notification as read:', notificationId),
      markAllNotificationsAsRead: () => console.log('Mark all notifications as read'),
      deleteNotification: (notificationId) => console.log('Delete notification:', notificationId),
      getUserNotifications: (userId) => { console.log('Get user notifications:', userId); return []; },
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser는 UserProvider 내부에서 사용해야 합니다');
  }
  return context;
}