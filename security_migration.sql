-- 🔐 보안 강화 마이그레이션 스크립트
-- 실행 전 반드시 데이터베이스 백업을 수행하세요

-- 1. 사용자 테이블에 보안 관련 컬럼 추가
DO $$ 
BEGIN
    -- 비밀번호 재설정 토큰
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'reset_token') THEN
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
    END IF;
    
    -- 비밀번호 재설정 토큰 만료 시간
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'reset_token_expires') THEN
        ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 로그인 실패 횟수
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
    
    -- 계정 잠금 시간
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'locked_until') THEN
        ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 2단계 인증 비밀키
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
    END IF;
    
    -- 2단계 인증 활성화 여부
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
    END IF;
    
    -- 마지막 비밀번호 변경 시간
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_changed_at') THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 세션 토큰
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'session_token') THEN
        ALTER TABLE users ADD COLUMN session_token VARCHAR(255);
    END IF;
    
    -- 세션 만료 시간
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'session_expires') THEN
        ALTER TABLE users ADD COLUMN session_expires TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. 감사 로그 테이블 생성
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 로그인 로그 테이블 생성
CREATE TABLE IF NOT EXISTS login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 세션 테이블 생성
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- 5. 권한 그룹 테이블 생성
CREATE TABLE IF NOT EXISTS permission_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 사용자-권한 그룹 매핑 테이블
CREATE TABLE IF NOT EXISTS user_permission_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_group_id UUID REFERENCES permission_groups(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, permission_group_id)
);

-- 7. 시스템 설정 테이블 생성
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_success ON login_logs(success);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);

-- 9. 기본 권한 그룹 데이터 삽입
INSERT INTO permission_groups (name, description, permissions) VALUES
('admin_full', '전체 관리자 권한', '["users.create", "users.read", "users.update", "users.delete", "users.view_all", "tasks.create", "tasks.read", "tasks.update", "tasks.delete", "tasks.assign", "tasks.view_all", "announcements.create", "announcements.read", "announcements.update", "announcements.delete", "announcements.publish", "reports.create", "reports.read", "reports.update", "reports.delete", "reports.view_all", "reports.approve", "sales.create", "sales.read", "sales.update", "sales.delete", "sales.view_all", "members.create", "members.read", "members.update", "members.delete", "members.view_all", "schedules.create", "schedules.read", "schedules.update", "schedules.delete", "schedules.view_all", "ot.create", "ot.read", "ot.update", "ot.delete", "ot.assign", "ot.view_all", "pass.create", "pass.read", "pass.update", "pass.delete", "pass.view_all", "vending.create", "vending.read", "vending.update", "vending.view_all", "suggestions.create", "suggestions.read", "suggestions.update", "suggestions.delete", "suggestions.respond", "suggestions.view_all", "manuals.read", "manuals.create", "manuals.update", "manuals.delete", "admin.dashboard", "admin.settings", "admin.logs", "admin.backup", "notifications.send", "notifications.manage"]'),
('reception_standard', '리셉션 표준 권한', '["users.view_own", "tasks.create", "tasks.read", "tasks.update", "tasks.view_department", "tasks.view_assigned", "tasks.comment", "announcements.read", "reports.create", "reports.read", "reports.view_department", "reports.view_own", "sales.create", "sales.read", "sales.update", "sales.view_all", "members.create", "members.read", "members.update", "members.view_all", "schedules.create", "schedules.read", "schedules.update", "schedules.view_all", "ot.create", "ot.read", "ot.update", "ot.assign", "ot.view_all", "ot.view_assigned", "ot.progress_update", "pass.create", "pass.read", "pass.update", "pass.view_all", "vending.create", "vending.read", "vending.update", "vending.view_all", "vending.view_own", "suggestions.create", "suggestions.read", "suggestions.view_own", "manuals.read"]'),
('trainer_standard', '트레이너 표준 권한', '["users.view_own", "tasks.create", "tasks.read", "tasks.update", "tasks.view_department", "tasks.view_assigned", "tasks.comment", "announcements.read", "reports.create", "reports.read", "reports.view_department", "reports.view_own", "sales.create", "sales.read", "sales.view_department", "sales.view_own", "members.read", "members.update", "members.view_department", "members.view_assigned", "schedules.create", "schedules.read", "schedules.update", "schedules.view_department", "schedules.view_own", "ot.read", "ot.view_assigned", "ot.progress_update", "vending.create", "vending.read", "vending.view_own", "suggestions.create", "suggestions.read", "suggestions.view_own", "manuals.read"]')
ON CONFLICT (name) DO NOTHING;

-- 10. 기본 시스템 설정 삽입
INSERT INTO system_settings (key, value, description) VALUES
('security.session_timeout', '24', '세션 타임아웃 (시간)'),
('security.max_login_attempts', '5', '최대 로그인 시도 횟수'),
('security.password_min_length', '8', '최소 비밀번호 길이'),
('security.enable_two_factor', 'false', '2단계 인증 활성화'),
('security.audit_logging', 'true', '감사 로깅 활성화'),
('system.backup_interval', '"daily"', '백업 주기'),
('system.maintenance_mode', 'false', '유지보수 모드')
ON CONFLICT (key) DO NOTHING;

-- 11. 트리거 함수 생성 (감사 로그용)
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
        VALUES (
            COALESCE(current_setting('audit.user_id', true)::UUID, NEW.created_by),
            'CREATE',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (
            COALESCE(current_setting('audit.user_id', true)::UUID, NEW.updated_by),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values)
        VALUES (
            current_setting('audit.user_id', true)::UUID,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 주요 테이블에 감사 트리거 추가
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_tasks ON tasks;
CREATE TRIGGER audit_tasks
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_announcements ON announcements;
CREATE TRIGGER audit_announcements
    AFTER INSERT OR UPDATE OR DELETE ON announcements
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 13. 세션 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- 15. RLS 정책 생성 (예시)
-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY users_own_data ON users
    FOR ALL
    TO authenticated
    USING (id = current_setting('auth.user_id')::UUID OR 
           current_setting('auth.role') = 'admin');

-- 업무는 담당자나 생성자, 관리자만 볼 수 있음
CREATE POLICY tasks_access ON tasks
    FOR ALL
    TO authenticated
    USING (assigned_to = current_setting('auth.user_id')::UUID OR 
           created_by = current_setting('auth.user_id')::UUID OR
           current_setting('auth.role') = 'admin');

-- 16. 보안 함수들
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    -- 실제로는 bcrypt나 다른 강력한 해싱 알고리즘 사용
    RETURN encode(digest(password || 'salt-spodot-2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash_password(password) = hash;
END;
$$ LANGUAGE plpgsql;

-- 17. 기존 평문 비밀번호 해시화 (주의: 이 작업은 되돌릴 수 없습니다!)
-- 실행하기 전에 반드시 백업을 수행하세요!
/*
UPDATE users 
SET password = hash_password(password), 
    password_changed_at = NOW()
WHERE length(password) < 60; -- 이미 해시된 비밀번호는 제외
*/

-- 18. 정리 작업을 위한 cron job 스케줄링 (PostgreSQL의 pg_cron 확장 필요)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON SCRIPT IS '보안 강화 마이그레이션: 사용자 인증, 감사 로깅, 권한 관리 시스템 구축';

-- 마이그레이션 완료 로그
INSERT INTO audit_logs (action, resource_type, resource_id, new_values)
VALUES ('MIGRATION', 'SYSTEM', 'security_migration', '{"version": "1.0", "completed_at": "' || NOW() || '"}'); 