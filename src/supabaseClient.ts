import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// Supabase 설정 정보
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://piwftspnolcvpytaqaeq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2Z0c3Bub2xjdnB5dGFxYWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODQzODMsImV4cCI6MjA2MjM2MDM4M30.79_5Nbygmj-lWnsG4Gq9E8hMk1it2UDz6IZ0vK9eAfc';

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
