// 회원 타입 정의
export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  join_date: string;
  membership_type: string;
  membership_start?: string;
  membership_end?: string;
  status: 'active' | 'inactive' | 'pending' | 'expired';
  trainer_id?: string;
  notes?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

// 회원권 타입 정의
export interface MembershipType {
  id: string;
  name: string;
  description: string;
  duration_months: number;
  price: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 트레이너 타입 정의
export interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string[];
  bio?: string;
  certification?: string[];
  working_hours?: {
    days: string[];
    start_time: string;
    end_time: string;
  };
  status: 'active' | 'inactive';
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

// 예약 타입 정의
export interface Appointment {
  id: string;
  member_id: string;
  trainer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'personal' | 'group' | 'assessment';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 결제 타입 정의
export interface Payment {
  id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'card' | 'cash' | 'bank_transfer' | 'other';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
}

// 수업 유형 정의
export interface ClassType {
  id: string;
  name: string;
  description: string;
  duration: number; // 분 단위
  capacity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  category: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 수업 일정 정의
export interface ClassSchedule {
  id: string;
  class_type_id: string;
  trainer_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  enrolled_count: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 회원 수업 등록 정의
export interface ClassEnrollment {
  id: string;
  class_schedule_id: string;
  member_id: string;
  status: 'enrolled' | 'attended' | 'no-show' | 'cancelled';
  enrollment_date: string;
  payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// PT 세션 정의
export interface PTSession {
  id: string;
  member_id: string;
  trainer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

// 시설/방 정의
export interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  equipment?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 첨부파일 타입 정의
export interface Attachment {
  name: string; // 파일명
  url: string;  // 파일 URL
  type?: string; // mime type (image/png 등)
}

// 공지사항 타입 정의
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  isPublished: boolean;
  targetAudience?: string;
  showInBanner?: boolean;
  category?: string;
  tags?: string[];
  readBy?: string[];
  attachments?: Attachment[];
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
}

// 직원(사용자) 상태 타입 (UserContext에서 사용)