import { supabase } from '../lib/supabase';
import { 
  getAuthHeaders, 
  checkRateLimit, 
  sanitizeInput, 
  validateInput,
  hashPassword,
  verifyPassword,
  createJWT,
  verifyJWT
} from '../utils/securityUtils';
import { Permission, hasPermission } from '../types/permissions';

// 🔐 보안 강화된 API 서비스

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class SecureApiService {
  private async makeSecureRequest<T>(
    endpoint: string,
    operation: () => Promise<{ data: T | null; error: any }>,
    requiredPermission?: Permission
  ): Promise<ApiResponse<T>> {
    try {
      // 레이트 리미팅 체크
      if (!checkRateLimit(endpoint)) {
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      }

      // 권한 체크
      if (requiredPermission) {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        const payload = verifyJWT(token);
        if (!payload) {
          throw new Error('인증이 만료되었습니다.');
        }

        if (!hasPermission(payload.role as any, requiredPermission)) {
          throw new Error('이 작업을 수행할 권한이 없습니다.');
        }
      }

      const { data, error } = await operation();
      
      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data || undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  // 🔐 인증 관련 보안 강화
  auth = {
    login: async (credentials: { email: string; password: string }): Promise<ApiResponse<any>> => {
      try {
        // 입력 검증
        if (!validateInput(credentials.email, 'email')) {
          throw new Error('올바른 이메일 형식이 아닙니다.');
        }
        if (!validateInput(credentials.password, 'password')) {
          throw new Error('비밀번호는 6자 이상이어야 합니다.');
        }

        // 입력 새니타이징
        const email = sanitizeInput(credentials.email);
        const passwordHash = hashPassword(credentials.password);

        // 사용자 조회
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 비밀번호 검증 (해시된 비밀번호와 비교)
        if (!verifyPassword(credentials.password, user.password)) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // JWT 토큰 생성
        const token = createJWT({
          userId: user.id,
          role: user.role,
          email: user.email
        });

        // 마지막 로그인 시간 업데이트
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);

        return {
          success: true,
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              avatar: user.profile_image,
              createdAt: user.created_at
            },
            token
          }
        };

      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
        };
      }
    },

    getCurrentUser: async (): Promise<ApiResponse<any>> => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        const payload = verifyJWT(token);
        if (!payload) {
          throw new Error('인증이 만료되었습니다.');
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('id, name, email, role, department, profile_image, created_at')
          .eq('id', payload.userId)
          .single();

        if (error) {
          throw new Error('사용자 정보를 가져올 수 없습니다.');
        }

        return {
          success: true,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatar: user.profile_image,
            createdAt: user.created_at
          }
        };

      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '사용자 정보 조회 중 오류가 발생했습니다.'
        };
      }
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<boolean>> => {
      return this.makeSecureRequest(
        'auth/change-password',
        async () => {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('로그인이 필요합니다.');

          const payload = verifyJWT(token);
          if (!payload) throw new Error('인증이 만료되었습니다.');

          // 현재 비밀번호 확인
          const { data: user } = await supabase
            .from('users')
            .select('password')
            .eq('id', payload.userId)
            .single();

          if (!user || !verifyPassword(currentPassword, user.password)) {
            throw new Error('현재 비밀번호가 올바르지 않습니다.');
          }

          // 새 비밀번호 유효성 검사
          if (!validateInput(newPassword, 'password')) {
            throw new Error('새 비밀번호는 6자 이상, 영문과 숫자를 포함해야 합니다.');
          }

          // 비밀번호 해시화 및 업데이트
          const newPasswordHash = hashPassword(newPassword);
          const result = await supabase
            .from('users')
            .update({ password: newPasswordHash })
            .eq('id', payload.userId);

          return { data: true, error: result.error };
        }
      );
    }
  };

  // 🔐 업무 관리 보안 강화
  tasks = {
    getAll: async (): Promise<ApiResponse<any[]>> => {
      return this.makeSecureRequest(
        'tasks/getAll',
        async () => {
          const query = supabase.from('tasks').select(`
            *,
            assigned_user:users!tasks_assigned_to_fkey(name),
            created_user:users!tasks_created_by_fkey(name)
          `);

          return await query.order('created_at', { ascending: false });
        },
        'tasks.read'
      );
    },

    create: async (taskData: any): Promise<ApiResponse<any>> => {
      return this.makeSecureRequest(
        'tasks/create',
        async () => {
          // 입력 검증
          if (!validateInput(taskData.title, 'text')) {
            throw new Error('제목을 입력해주세요.');
          }

          const sanitizedData = {
            title: sanitizeInput(taskData.title),
            description: taskData.description ? sanitizeInput(taskData.description) : null,
            status: taskData.status || 'pending',
            priority: taskData.priority || 'medium',
            category: taskData.category ? sanitizeInput(taskData.category) : null,
            assigned_to: taskData.assigneeId,
            created_by: taskData.assignerId,
            due_date: taskData.dueDate,
            tags: taskData.tags || []
          };

          return await supabase
            .from('tasks')
            .insert(sanitizedData)
            .select()
            .single();
        },
        'tasks.create'
      );
    },

    update: async (id: string, taskData: any): Promise<ApiResponse<any>> => {
      return this.makeSecureRequest(
        'tasks/update',
        async () => {
          // 권한 체크: 작성자나 담당자만 수정 가능
          const token = localStorage.getItem('authToken');
          const payload = verifyJWT(token!);
          
          const { data: task } = await supabase
            .from('tasks')
            .select('assigned_to, created_by')
            .eq('id', id)
            .single();

          if (task && payload?.role !== 'admin' && 
              task.assigned_to !== payload?.userId && 
              task.created_by !== payload?.userId) {
            throw new Error('이 업무를 수정할 권한이 없습니다.');
          }

          const sanitizedData = {
            title: taskData.title ? sanitizeInput(taskData.title) : undefined,
            description: taskData.description ? sanitizeInput(taskData.description) : undefined,
            status: taskData.status,
            priority: taskData.priority,
            category: taskData.category ? sanitizeInput(taskData.category) : undefined,
            assigned_to: taskData.assigneeId,
            due_date: taskData.dueDate,
            tags: taskData.tags
          };

          return await supabase
            .from('tasks')
            .update(sanitizedData)
            .eq('id', id)
            .select()
            .single();
        },
        'tasks.update'
      );
    },

    delete: async (id: string): Promise<ApiResponse<boolean>> => {
      return this.makeSecureRequest(
        'tasks/delete',
        async () => {
          // 권한 체크: 작성자나 관리자만 삭제 가능
          const token = localStorage.getItem('authToken');
          const payload = verifyJWT(token!);
          
          const { data: task } = await supabase
            .from('tasks')
            .select('created_by')
            .eq('id', id)
            .single();

          if (task && payload?.role !== 'admin' && task.created_by !== payload?.userId) {
            throw new Error('이 업무를 삭제할 권한이 없습니다.');
          }

          const result = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

          return { data: true, error: result.error };
        },
        'tasks.delete'
      );
    }
  };

  // 🔐 공지사항 관리 보안 강화
  announcements = {
    getAll: async (): Promise<ApiResponse<any[]>> => {
      return this.makeSecureRequest(
        'announcements/getAll',
        async () => {
          return await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
        },
        'announcements.read'
      );
    },

    create: async (announcementData: any): Promise<ApiResponse<any>> => {
      return this.makeSecureRequest(
        'announcements/create',
        async () => {
          if (!validateInput(announcementData.title, 'text')) {
            throw new Error('제목을 입력해주세요.');
          }

          const sanitizedData = {
            title: sanitizeInput(announcementData.title),
            content: sanitizeInput(announcementData.content),
            author_id: announcementData.authorId,
            author_name: sanitizeInput(announcementData.authorName),
            priority: announcementData.priority || 'medium',
            tags: announcementData.tags || [],
            expiry_date: announcementData.expiryDate,
            is_pinned: announcementData.isPinned || false,
            is_active: announcementData.isActive !== false,
            target_roles: announcementData.targetRoles || [],
            attachments: announcementData.attachments || []
          };

          return await supabase
            .from('announcements')
            .insert(sanitizedData)
            .select()
            .single();
        },
        'announcements.create'
      );
    }
  };
}

export const secureApiService = new SecureApiService();
export default secureApiService; 