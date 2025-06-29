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

// 고객 인터페이스 (별도 관리)
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
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

// 트레이너 인터페이스 (별도 관리)
export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
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

// 직원 인터페이스 - 새로운 권한 시스템 사용
export interface Staff extends User {
  id: string;
  employeeId?: string;
  team?: Team | null;
  position?: UserPosition;
  hireDate?: string;
  department?: string;
  permissions?: string[]; // 개별 설정된 권한 배열
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
  // 초기 사용자 목록 - 빈 배열로 시작
  const initialUsers: User[] = [];
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
      // Supabase에서 users 테이블 조회 - 모든 역할의 활성 사용자 조회
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

      console.log('📋 데이터베이스에서 조회된 사용자들:', data);

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

      console.log('🔄 변환된 직원 데이터:', transformedStaff);
      setStaffList(transformedStaff as Staff[]);
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
          role: staffData.role,
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
      console.log('직원 삭제 시도:', id);
      
      // 1. 먼저 해당 직원에게 할당된 모든 tasks의 assigned_to를 null로 설정
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('assigned_to', id);

      if (tasksError) {
        console.error('업무 재할당 오류:', tasksError);
        const errorMessage = tasksError.message || '업무 재할당 중 오류가 발생했습니다.';
        alert('직원 삭제 오류 (업무 재할당): ' + errorMessage);
        return false;
      }

      console.log('해당 직원의 업무 재할당 완료');

      // 2. 직원의 상태를 먼저 inactive로 변경 (soft delete 방식)
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('직원 상태 업데이트 오류:', updateError);
        const errorMessage = updateError.message || '직원 상태 업데이트 중 오류가 발생했습니다.';
        alert('직원 삭제 오류 (상태 업데이트): ' + errorMessage);
        return false;
      }

      console.log('직원 상태 비활성화 완료');

      // 3. 실제 데이터베이스에서 삭제 시도
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('직원 삭제 오류:', deleteError);
        // 삭제에 실패하면 상태만 비활성화된 상태로 유지
        console.log('데이터베이스 삭제 실패, 상태만 비활성화로 유지');
        alert('직원이 비활성화되었습니다. (데이터베이스 제약조건으로 인해 완전 삭제는 불가)');
      } else {
        console.log('직원 삭제 성공:', id);
        alert('직원이 성공적으로 삭제되었습니다.');
      }

      // 4. 로컬 상태에서 제거
      setStaffList(prevStaff => prevStaff.filter(staff => staff.id !== id));
      
      // 5. 직원 목록 새로고침
      await fetchStaff();
      
      return true;
    } catch (err) {
      console.error('직원 삭제 오류:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert('직원 삭제 오류: ' + errorMessage);
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