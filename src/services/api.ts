import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// 간단한 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface FilterOptions {
  [key: string]: any;
}

class ApiService {
  private handleError(error: any): never {
    console.error('API Error:', error);
    throw new Error(error.message || 'API 요청 실패');
  }

  private formatResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      message: 'Success'
    };
  }

  // 인증 관련
  auth = {
    login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: any; token: string }>> => {
      try {
        console.log('🔐 로그인 시도:', credentials.email);
        console.log('📡 Supabase 연결 중...');
        
        // Supabase 연결 테스트
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        console.log('🧪 Supabase 연결 테스트:', { testData, testError });
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        console.log('📊 사용자 조회 결과:', { data, error });

        if (error) {
          console.error('❌ 사용자 조회 오류:', error);
          if (error.code === 'PGRST116') {
            throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
          }
          throw new Error('데이터베이스 연결 오류가 발생했습니다.');
        }
        
        if (!data) {
          console.error('❌ 사용자 데이터 없음');
          throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 비밀번호 검증 (실제 환경에서는 bcrypt 사용)
        console.log('🔑 비밀번호 검증:', {
          입력된비밀번호: credentials.password,
          저장된비밀번호: data.password,
          일치여부: credentials.password === data.password
        });
        
        if (credentials.password !== data.password) {
          throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
        }

        // 로그인 성공
        const user: any = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          position: data.position,
          permissions: data.permissions || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        const token = `fake-jwt-token-${Date.now()}`;
        
        console.log('✅ 로그인 성공:', user);
        
        return this.formatResponse({ user, token });
      } catch (error: any) {
        console.error('💥 로그인 실패:', error);
        throw error;
      }
    },
    
    logout: async (): Promise<ApiResponse<void>> => {
      return this.formatResponse(undefined);
    },
    
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
      try {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
          throw new Error('인증되지 않은 사용자입니다.');
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !data) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        const user: any = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as any,
          department: data.department,
          position: data.position as any,
          permissions: data.permissions || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        return this.formatResponse(user);
      } catch (error) {
        this.handleError(error);
      }
    },
    
    refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
      return this.formatResponse({ token: 'refreshed-token' });
    },
  };

  // 나머지 메서드들은 기본 구현만 유지
  tasks = {
    getAll: async (): Promise<any> => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }),
    getById: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
    create: async (task: any): Promise<any> => { throw new Error('구현 필요'); },
    update: async (id: string, task: any): Promise<any> => { throw new Error('구현 필요'); },
    delete: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
    addComment: async (taskId: string, content: string): Promise<any> => this.formatResponse(undefined),
  };

  dailyReports = {
    getAll: async (): Promise<any> => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }),
    getById: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
    create: async (report: any): Promise<any> => { throw new Error('구현 필요'); },
    update: async (id: string, report: any): Promise<any> => { throw new Error('구현 필요'); },
    uploadImage: async (file: File): Promise<any> => { throw new Error('구현 필요'); },
  };

  announcements = {
    getAll: async (): Promise<any> => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return this.formatResponse({
          items: data || [],
          total: data?.length || 0,
          page: 1,
          limit: 50
        });
      } catch (error) {
        this.handleError(error);
      }
    },
    getById: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
    create: async (announcement: any): Promise<any> => { throw new Error('구현 필요'); },
    update: async (id: string, announcement: any): Promise<any> => { throw new Error('구현 필요'); },
    delete: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
    markAsRead: async (id: string): Promise<any> => this.formatResponse(undefined),
  };

  suggestions = {
    getAll: async (): Promise<any> => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }),
    getById: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
    create: async (suggestion: any): Promise<any> => { throw new Error('구현 필요'); },
    update: async (id: string, suggestion: any): Promise<any> => { throw new Error('구현 필요'); },
    delete: async (id: string): Promise<any> => { throw new Error('구현 필요'); },
  };

  notifications = {
    getAll: async (): Promise<any> => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }),
    markAsRead: async (id: string): Promise<any> => this.formatResponse(undefined),
  };

  // 기타 필요한 메서드들
  manuals = { getAll: async () => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }) };
  sales = { getAll: async () => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }) };
  customers = { getAll: async () => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }) };
  users = { getAll: async () => this.formatResponse({ items: [], total: 0, page: 1, limit: 50 }) };
  dashboard = { getStats: async () => this.formatResponse({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, totalUsers: 0, activeAnnouncements: 0, todayReports: 0 }) };
  search = { global: async (query: string) => this.formatResponse([]) };
}

export const apiService = new ApiService(); 