import { useState } from 'react';
import { X, Save, User, Shield, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useUser, UserStatus, Staff } from '../../contexts/UserContext';
import { UserPosition, positionInfo } from '../../types/permissions';
import clsx from 'clsx';

export interface AddStaffFormProps {
  onClose: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_clients', label: '고객 조회' },
  { id: 'edit_clients', label: '고객 편집' },
  { id: 'view_trainers', label: '트레이너 조회' },
  { id: 'edit_trainers', label: '트레이너 편집' },
  { id: 'view_schedules', label: '일정 조회' },
  { id: 'edit_schedules', label: '일정 편집' },
  { id: 'view_tasks', label: '업무 조회' },
  { id: 'edit_tasks', label: '업무 편집' },
  { id: 'view_reports', label: '보고서 조회' },
  { id: 'edit_reports', label: '보고서 편집' },
  { id: 'view_equipment', label: '장비 조회' },
  { id: 'edit_equipment', label: '장비 편집' },
  { id: 'view_inventory', label: '재고 조회' },
  { id: 'edit_inventory', label: '재고 편집' },
  { id: 'view_payments', label: '결제 조회' },
  { id: 'process_payments', label: '결제 처리' },
];

const AddStaffForm = ({ onClose }: AddStaffFormProps) => {
  const { addStaff } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'active' as UserStatus,
    department: '',
    position: '' as UserPosition,
    hireDate: format(new Date(), 'yyyy-MM-dd'),
    role: 'staff' as 'staff' | 'admin',
    permissions: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // 관리자 역할이 선택되면 모든 권한 추가
    if (name === 'role' && value === 'admin') {
      setFormData(prev => ({
        ...prev,
        role: 'admin',
        permissions: ['all']
      }));
    } else if (name === 'role' && value === 'staff') {
      setFormData(prev => ({
        ...prev,
        role: 'staff',
        permissions: []
      }));
    }
  };
  
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, value]
        };
      } else {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== value)
        };
      }
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 필수 필드 검증
    if (!formData.name) newErrors.name = '이름을 입력해 주세요';
    if (!formData.email) {
      newErrors.email = '이메일을 입력해 주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해 주세요';
    }
    
    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해 주세요';
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(formData.phone) && !/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = '유효한 전화번호 형식을 입력해 주세요 (예: 010-1234-5678 또는 01012345678)';
    }
    
    // 비밀번호 유효성 검사 - 이제 간소화됨
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해 주세요';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해 주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    if (!formData.department) newErrors.department = '부서를 입력해 주세요';
    if (!formData.position) newErrors.position = '직책을 입력해 주세요';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('직원 폼 제출 시작');
    
    if (!validateForm()) {
      console.log('폼 유효성 검사 실패');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 직원 데이터 준비
      const staffData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        status: formData.status,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        hireDate: formData.hireDate,
        permissions: formData.permissions
      };
      
      console.log('직원 데이터:', staffData);
      
      // 직원 추가
      if (addStaff) {
        console.log('addStaff 함수 호출');
        const userId = await addStaff(staffData);
        console.log('직원 추가 결과:', userId);
        
        if (userId) {
          alert('직원이 성공적으로 추가되었습니다.\n이메일: ' + formData.email + '\n비밀번호: ' + formData.password);
          // 폼 닫기
          onClose();
        } else {
          console.error("직원 추가 실패: userId가 반환되지 않음");
        }
      } else {
        console.error("addStaff function is not available in UserContext");
        setErrors(prev => ({ ...prev, form: "직원 추가 기능을 사용할 수 없습니다." }));
      }
    } catch (error) {
      console.error('직원 추가 중 오류 발생:', error);
      setErrors(prev => ({ ...prev, form: "직원 추가 중 오류가 발생했습니다." }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            새 직원 추가
          </h2>
          <button 
            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기본 정보 섹션 */}
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">기본 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      이름
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.name ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      placeholder="직원 이름"
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* 상태 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      상태
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-input w-full"
                      required
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                      <option value="pending">대기중</option>
                    </select>
                  </div>
                  
                  {/* 이메일 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      이메일
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.email ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      placeholder="example@mail.com"
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* 전화번호 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      전화번호
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.phone ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      placeholder="010-1234-5678"
                      required
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      비밀번호
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.password ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      placeholder="********"
                      required
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  
                  {/* 비밀번호 확인 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      비밀번호 확인
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.confirmPassword ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      placeholder="********"
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 직원 정보 섹션 */}
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">직원 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 부서 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      부서
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.department ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      required
                    >
                      <option value="">부서 선택</option>
                      <option value="임원">임원</option>
                      <option value="헬스">헬스</option>
                      <option value="테니스">테니스</option>
                      <option value="골프">골프</option>
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-500">{errors.department}</p>
                    )}
                  </div>
                  
                  {/* 직책 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      직책
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className={clsx(
                        'form-input w-full',
                        errors.position ? 'border-red-500 dark:border-red-500' : ''
                      )}
                      required
                    >
                      <option value="">직책 선택</option>
                      {Object.entries(positionInfo).map(([key, info]) => (
                        <option key={key} value={key as UserPosition}>
                          {info.name}
                        </option>
                      ))}
                    </select>
                    {errors.position && (
                      <p className="mt-1 text-sm text-red-500">{errors.position}</p>
                    )}
                  </div>
                  
                  {/* 입사일 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      입사일
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleChange}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  
                  {/* 역할 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      역할
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-input w-full"
                      required
                    >
                      <option value="staff">일반 직원</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 권한 섹션 */}
              {formData.role !== 'admin' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white">권한 설정</h3>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      (직원이 접근할 수 있는 기능을 선택하세요)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {AVAILABLE_PERMISSIONS.map(permission => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={permission.id}
                          value={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={handlePermissionChange}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={permission.id}
                          className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 관리자 경고 */}
              {formData.role === 'admin' && (
                <div className="md:col-span-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-300">관리자 권한 안내</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        관리자는 모든 기능에 대한 접근 권한을 가집니다. 시스템 전체 설정을 변경하고 모든 데이터에 접근할 수 있습니다. 
                        관리자 권한은 꼭 필요한 직원에게만 부여해야 합니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="btn btn-primary inline-flex items-center"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={16} className="mr-2" />
            {isSubmitting ? '저장 중...' : '직원 저장'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddStaffForm; 