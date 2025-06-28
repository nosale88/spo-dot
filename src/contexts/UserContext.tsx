import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Team } from '../types';
// Supabase 클라이언트 임포트
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database.types';
import { UserRole, UserPosition, DatabaseRole, mapUserRoleToDatabaseRole } from '../types/permissions';

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
  role: DatabaseRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  profileImage?: string | null;
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
  position?: UserPosition;
  hireDate?: string;
  department?: string;
  permissions?: string[];
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  profileImage?: string | null;
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
  isSubmitting?: boolean;

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
  addStaff?: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt' | 'role'> & { role: UserRole } ) => Promise<string | null>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    setStaffError(null);
    try {
      // Supabase에서 users 테이블 조회
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'trainer', 'staff', 'user', 'client']);  // 모든 허용된 DatabaseRole 조회

      if (error) {
        console.error('Error fetching staff:', error);
        setStaffError(error);
        setLoadingStaff(false);
        return;
      }

      // 데이터 형식 변환 - 이제 모든 필드 사용 가능
      const transformedStaff = data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role as DatabaseRole,
        status: (user.status as UserStatus) || 'active',
        department: user.department || '',
        position: user.position as UserPosition || '',
        permissions: user.permissions as string[] || [],
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: user.updated_at || new Date().toISOString(),
        lastLogin: user.last_login as string | null,
        profileImage: user.profile_image
      }));

      setStaffList(transformedStaff);
    } catch (err) {
      console.error('직원 데이터 가져오기 오류:', err);
      setStaffError(err as Error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const addStaffMember = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt' | 'role'> & { role: UserRole }): Promise<string | null> => {
    setIsSubmitting(true);
    try {
      // UserRole을 DatabaseRole로 변환
      const databaseRole = mapUserRoleToDatabaseRole(staffData.role);

      const { data, error } = await supabase.auth.signUp({
        email: staffData.email,
        password: staffData.password || '',
        options: {
          data: {
            name: staffData.name,
            phone: staffData.phone,
            status: staffData.status,
            role: databaseRole,
            department: staffData.department,
            position: staffData.position,
            hire_date: staffData.hireDate,
            permissions: staffData.permissions || [],
          },
        },
      });

      if (error) {
        console.error('Supabase 회원가입 오류:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('사용자 데이터 없음');
      }

      // 성공 시 새로운 직원 목록 다시 가져오기
      await fetchStaff();
      return data.user.id;
    } catch (error) {
      console.error('직원 추가 중 오류 발생:', error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStaffMember = async (id: string, staffData: Partial<Staff>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: staffData.name,
          phone: staffData.phone,
          status: staffData.status,
          department: staffData.department,
          position: staffData.position,
          permissions: staffData.permissions,
        })
        .eq('id', id);

      if (error) {
        console.error('직원 업데이트 오류:', error);
        throw new Error(error.message);
      }
      await fetchStaff();
      return true;
    } catch (error) {
      console.error('직원 업데이트 중 오류 발생:', error);
      return false;
    }
  };

  const deleteStaffMember = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('직원 삭제 오류:', error);
        throw new Error(error.message);
      }
      await fetchStaff();
      return true;
    } catch (error) {
      console.error('직원 삭제 중 오류 발생:', error);
      return false;
    }
  };

  const updatePermission = (id: string, permissions: string[]) => {
    // 현재는 이 함수가 사용되지 않거나 더 이상 필요하지 않을 수 있습니다.
    // 필요하다면 이곳에 로직을 추가하세요.
    console.log(`Updating permissions for ${id} to ${permissions}`);
  };

  const value = {
    users,
    staff: staffList,
    loadingStaff,
    staffError,
    isSubmitting,
    addStaff: addStaffMember,
    updateStaff: updateStaffMember,
    deleteUser: deleteStaffMember,
    updatePermissions: updatePermission,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}