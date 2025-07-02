import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// 환경 변수 또는 기본값 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://htsvzzphkvtjoamzmtya.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0c3Z6enBoa3Z0am9hbXptdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTY5NzMsImV4cCI6MjA2Njc3Mjk3M30.MQf_uCdUs2USGRvH-nTPGtqt87L6FX1q5L_A2TSh4J0';

// 개발 환경에서만 경고 표시
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.');
}

console.log('🔗 Supabase 연결:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
