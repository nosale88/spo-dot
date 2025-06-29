-- 🏗️ Spodot 피트니스 관리 시스템 - 새 Supabase 프로젝트 완전 마이그레이션
-- 프로젝트 ID: htsvzzphkvtjoamzmtya
-- 생성일: 2025-01-28

-- ===== 기본 설정 =====
SET timezone = 'Asia/Seoul';

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== 테이블 생성 =====

-- 1. 사용자 테이블 (최고 우선순위)
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  role varchar(20) CHECK (role IN ('admin', 'reception', 'fitness', 'tennis', 'golf')) NOT NULL DEFAULT 'reception',
  department varchar(100),
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  phone varchar(20),
  position varchar(100),
  permissions jsonb DEFAULT '[]',
  profile_image varchar(500),
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. 업무 관리 테이블
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority varchar(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category varchar(50) DEFAULT 'general' CHECK (category IN ('maintenance', 'administrative', 'client', 'training', 'general')),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date date,
  start_time time,
  end_time time,
  tags jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. 업무 댓글 테이블
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name varchar(255) NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. 일일 보고서 테이블
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name varchar(255) NOT NULL,
  date date NOT NULL,
  content text,
  tasks jsonb DEFAULT '[]',
  issues text,
  tomorrow text,
  images jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(author_id, date) -- 한 사용자는 하루에 하나의 보고서만
);

-- 5. 공지사항 테이블
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name varchar(255) NOT NULL,
  priority varchar(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags jsonb DEFAULT '[]',
  expiry_date date,
  is_pinned boolean DEFAULT false,
  is_active boolean DEFAULT true,
  target_roles jsonb DEFAULT '[]',
  read_by jsonb DEFAULT '[]',
  attachments jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. 건의사항 테이블
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name varchar(255) NOT NULL,
  category varchar(50) DEFAULT 'general' CHECK (category IN ('facility', 'service', 'system', 'training', 'general')),
  priority varchar(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'implemented')),
  admin_response text,
  admin_response_by varchar(255),
  admin_response_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  title varchar(255) NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  link varchar(500),
  created_at timestamp with time zone DEFAULT now()
);

-- 8. 일정 관리 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name varchar(255) NOT NULL,
  client_id uuid REFERENCES users(id) ON DELETE SET NULL,
  trainer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_name varchar(255) NOT NULL,
  type varchar(50) CHECK (type IN ('PT', 'OT', 'GROUP', 'CONSULT')) NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  recurrence varchar(20) DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  recurrence_end_date date,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 9. 회원/고객 테이블
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  address text,
  date_of_birth date,
  gender varchar(10) CHECK (gender IN ('male', 'female', 'other')),
  emergency_contact varchar(100),
  height decimal(5,2),
  weight decimal(5,2),
  goals text,
  health_notes text,
  membership_type varchar(50),
  membership_start date,
  membership_end date,
  assigned_trainer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 10. 트레이너 테이블
CREATE TABLE IF NOT EXISTS trainers (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio text,
  experience text,
  certifications jsonb DEFAULT '[]',
  specialties jsonb DEFAULT '[]',
  hourly_rate decimal(10,2),
  schedule jsonb DEFAULT '{}',
  schedule_preference jsonb DEFAULT '{}',
  client_count integer DEFAULT 0,
  address text,
  date_of_birth date,
  gender varchar(10) CHECK (gender IN ('male', 'female', 'other')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 11. 패스 관리 테이블
CREATE TABLE IF NOT EXISTS passes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  amount decimal(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 12. 매출 기록 테이블
CREATE TABLE IF NOT EXISTS sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name varchar(255) NOT NULL,
  amount decimal(10,2) NOT NULL,
  pass_id uuid REFERENCES passes(id) ON DELETE SET NULL,
  sale_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 13. 인수인계 테이블
CREATE TABLE IF NOT EXISTS handovers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name varchar(255) NOT NULL,
  date date NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 14. 팀 관리 테이블
CREATE TABLE IF NOT EXISTS teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  department varchar(100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 15. 팀 멤버 테이블
CREATE TABLE IF NOT EXISTS staff_teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- ===== 인덱스 생성 =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_id ON task_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_author_id ON daily_reports(author_id);

CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_expiry_date ON announcements(expiry_date);

CREATE INDEX IF NOT EXISTS idx_suggestions_author_id ON suggestions(author_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);
CREATE INDEX IF NOT EXISTS idx_suggestions_priority ON suggestions(priority);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_schedules_trainer_id ON schedules(trainer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_client_id ON schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_type ON schedules(type);

CREATE INDEX IF NOT EXISTS idx_clients_assigned_trainer ON clients(assigned_trainer_id);
CREATE INDEX IF NOT EXISTS idx_clients_membership_type ON clients(membership_type);

CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_pass_id ON sales(pass_id);

CREATE INDEX IF NOT EXISTS idx_handovers_date ON handovers(date);
CREATE INDEX IF NOT EXISTS idx_handovers_author_id ON handovers(author_id);

-- ===== 트리거 생성 =====
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suggestions_updated_at BEFORE UPDATE ON suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passes_updated_at BEFORE UPDATE ON passes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_handovers_updated_at BEFORE UPDATE ON handovers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== 초기 데이터 삽입 =====

-- 관리자 계정 생성
INSERT INTO users (name, email, password, role, department, status, position) VALUES
('시스템 관리자', 'admin@spodot.com', '$2b$10$jJ4.mGZb8E7lQfOuQr3nBu7s6qgL5JXcVmx4xT9rE8dM6w2P1s3K4', 'admin', '관리부', 'active', '시스템 관리자'),
('김리셉션', 'reception@spodot.com', '$2b$10$jJ4.mGZb8E7lQfOuQr3nBu7s6qgL5JXcVmx4xT9rE8dM6w2P1s3K4', 'reception', '리셉션', 'active', '리셉션 매니저'),
('박트레이너', 'fitness@spodot.com', '$2b$10$jJ4.mGZb8E7lQfOuQr3nBu7s6qgL5JXcVmx4xT9rE8dM6w2P1s3K4', 'fitness', '피트니스', 'active', '시니어 트레이너'),
('이테니스', 'tennis@spodot.com', '$2b$10$jJ4.mGZb8E7lQfOuQr3nBu7s6qgL5JXcVmx4xT9rE8dM6w2P1s3K4', 'tennis', '테니스', 'active', '테니스 코치'),
('최골프', 'golf@spodot.com', '$2b$10$jJ4.mGZb8E7lQfOuQr3nBu7s6qgL5JXcVmx4xT9rE8dM6w2P1s3K4', 'golf', '골프', 'active', '골프 프로')
ON CONFLICT (email) DO NOTHING;

-- 기본 팀 생성
INSERT INTO teams (name, description, department) VALUES
('관리팀', '시설 전체 관리 및 운영', '관리부'),
('리셉션팀', '고객 접수 및 안내', '리셉션'),
('피트니스팀', '웨이트 트레이닝 및 개인 훈련', '피트니스'),
('테니스팀', '테니스 레슨 및 코트 관리', '테니스'),
('골프팀', '골프 레슨 및 연습장 관리', '골프')
ON CONFLICT DO NOTHING;

-- 기본 패스 상품 생성
INSERT INTO passes (name, description, amount) VALUES
('1개월 회원권', '헬스장 1개월 이용권', 120000),
('3개월 회원권', '헬스장 3개월 이용권', 300000),
('6개월 회원권', '헬스장 6개월 이용권', 540000),
('1년 회원권', '헬스장 1년 이용권', 960000),
('PT 10회권', '개인 트레이닝 10회 이용권', 500000),
('PT 20회권', '개인 트레이닝 20회 이용권', 900000),
('테니스 그룹레슨 10회', '테니스 그룹 레슨 10회권', 300000),
('골프 개인레슨 5회', '골프 개인 레슨 5회권', 400000)
ON CONFLICT DO NOTHING;

-- 샘플 공지사항
INSERT INTO announcements (title, content, author_name, priority, is_pinned, is_active) VALUES
('스포닷 센터 관리 시스템 오픈', '새로운 관리 시스템이 오픈되었습니다. 모든 직원은 사용법을 숙지해 주세요.', '시스템 관리자', 'high', true, true),
('월간 직원 회의 안내', '이번 달 직원 회의는 매월 마지막 금요일 오후 6시에 진행됩니다.', '시스템 관리자', 'medium', false, true),
('시설 점검 안내', '매주 일요일 오전 9시-10시는 시설 점검 시간입니다.', '시스템 관리자', 'medium', false, true)
ON CONFLICT DO NOTHING;

-- ===== 완료 메시지 =====
-- 설치 확인을 위한 메타 테이블
CREATE TABLE IF NOT EXISTS system_meta (
  key varchar(100) PRIMARY KEY,
  value text,
  created_at timestamp with time zone DEFAULT now()
);

INSERT INTO system_meta (key, value) VALUES 
('schema_version', '1.0.0'),
('installation_date', NOW()::text),
('project_name', 'Spodot Fitness Management System'),
('project_id', 'htsvzzphkvtjoamzmtya')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 스키마 설치 완료
SELECT 'Spodot 피트니스 관리 시스템 스키마가 성공적으로 설치되었습니다!' as installation_status; 