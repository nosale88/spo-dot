import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Team } from '../types';
// Supabase 클라이언트 임포트
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database.types';

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
  department?: string;
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
      // Supabase에서 users 테이블 조회
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'staff']);  // admin과 staff 역할을 가진 사용자만 조회

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
        role: user.role as UserRole,
        status: (user.status as UserStatus) || 'active',
        department: user.department || '',
        position: user.position || '',
        permissions: user.permissions || [],
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: user.updated_at || new Date().toISOString(),
        lastLogin: user.last_login,
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

  // 직원 추가 함수
  const addStaffMember = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    try {
      console.log('직원 추가 시도:', staffData);
      
      // 기본 사용자 데이터 추가
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: staffData.name,
            email: staffData.email,
            password: staffData.password || '123456', // 기본 비밀번호
            role: staffData.role === 'staff' ? 'staff' : staffData.role || 'staff', // 이제 'staff' 역할 사용 가능
            phone: staffData.phone || '',
            department: staffData.department || '',
            position: staffData.position || '',
            status: staffData.status || 'active',
            permissions: staffData.permissions || []
          }
        ])
        .select();

      if (error) {
        console.error('직원 추가 중 오류:', error);
        alert('직원 추가 오류: ' + error.message);
        return null;
      }

      console.log('직원 추가 성공:', data);
      
      // 반환된 데이터로 새 직원 정보 구성
      const newStaff = {
        ...staffData,
        id: data[0].id,
        createdAt: data[0].created_at || new Date().toISOString(),
        updatedAt: data[0].updated_at || new Date().toISOString(),
      };

      // 상태 업데이트
      setStaffList(prevStaff => [...prevStaff, newStaff as Staff]);

      // 성공 시 ID 반환
      return data[0].id;
    } catch (err) {
      console.error('직원 추가 오류:', err);
      alert('직원 추가 오류: ' + (err instanceof Error ? err.message : String(err)));
      return null;
    }
  };

  // 직원 수정 함수
  const updateStaffMember = async (id: string, staffData: Partial<Staff>): Promise<boolean> => {
    try {
      // Supabase에 업데이트 - 이제 모든 필드 사용 가능
      const { error } = await supabase
        .from('users')
        .update({
          name: staffData.name,
          email: staffData.email,
          phone: staffData.phone,
          role: staffData.role === 'staff' ? 'staff' : staffData.role,
          status: staffData.status,
          department: staffData.department,
          position: staffData.position,
          permissions: staffData.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('직원 업데이트 오류:', error);
        alert('직원 업데이트 오류: ' + error.message);
        return false;
      }

      // 로컬 상태 업데이트
      setStaffList(prevStaff => prevStaff.map(staff => 
        staff.id === id 
          ? { ...staff, ...staffData, updatedAt: new Date().toISOString() } 
          : staff
      ));

      return true;
    } catch (err) {
      console.error('직원 수정 오류:', err);
      alert('직원 수정 오류: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  };

  // 직원 삭제 함수
  const deleteStaffMember = async (id: string): Promise<boolean> => {
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('직원 삭제 오류:', error);
        return false;
      }

      // 로컬 상태 업데이트
      setStaffList(prevStaff => prevStaff.filter(staff => staff.id !== id));
      return true;
    } catch (err) {
      console.error('직원 삭제 오류:', err);
      return false;
    }
  };

  // 권한 업데이트 함수
  const updatePermission = (id: string, permissions: string[]) => {
    setStaffList(prevStaff => prevStaff.map(staff => 
      staff.id === id ? { ...staff, permissions } : staff
    ));
  };

  return (
    <UserContext.Provider
      value={{
        users,
        staff: staffList,
        loadingStaff,
        staffError,
        // 직원 관련 함수
        addStaff: addStaffMember,
        updateStaff: updateStaffMember,
        deleteUser: deleteStaffMember,
        updatePermissions: updatePermission,
      }}
    >
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