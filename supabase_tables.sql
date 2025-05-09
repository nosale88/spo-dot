-- 회원 테이블
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_type UUID,
  membership_start DATE,
  membership_end DATE,
  status TEXT NOT NULL DEFAULT 'active',
  trainer_id UUID,
  notes TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회원권 종류 테이블
CREATE TABLE membership_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 트레이너 테이블
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specialization JSONB,
  bio TEXT,
  certification JSONB,
  working_hours JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예약 테이블
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 결제 테이블
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT NOT NULL,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 외래 키 제약 조건 추가
ALTER TABLE members ADD CONSTRAINT fk_membership_type 
FOREIGN KEY (membership_type) REFERENCES membership_types(id) ON DELETE SET NULL;

ALTER TABLE members ADD CONSTRAINT fk_trainer_id
FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL;

-- 샘플 데이터 추가: 회원권 종류
INSERT INTO membership_types (name, description, duration_months, price, features, is_active) VALUES
('기본 회원권', '기본 시설 이용', 1, 50000, '["헬스장 이용", "샤워 시설"]', TRUE),
('프리미엄 회원권', '모든 시설 및 수업 이용', 1, 100000, '["헬스장 이용", "모든 그룹 수업", "사우나", "개인 사물함"]', TRUE),
('연간 회원권', '1년 약정 할인', 12, 500000, '["헬스장 이용", "제한된 그룹 수업", "사우나"]', TRUE);

-- 샘플 데이터 추가: 트레이너
INSERT INTO trainers (first_name, last_name, email, phone, specialization, certification, status) VALUES
('김', '철수', 'kim@example.com', '010-1234-5678', '["웨이트 트레이닝", "바디빌딩"]', '["개인 트레이너 자격증", "스포츠 영양사"]', 'active'),
('이', '영희', 'lee@example.com', '010-2345-6789', '["요가", "필라테스", "스트레칭"]', '["요가 지도자 자격증", "필라테스 자격증"]', 'active'),
('박', '지민', 'park@example.com', '010-3456-7890', '["크로스핏", "기능성 트레이닝"]', '["크로스핏 레벨 1 트레이너", "운동 처방사"]', 'active');

-- 트리거 함수: 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 테이블별 트리거 설정
CREATE TRIGGER set_timestamp_members
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_membership_types
BEFORE UPDATE ON membership_types
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_trainers
BEFORE UPDATE ON trainers
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_payments
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp(); 