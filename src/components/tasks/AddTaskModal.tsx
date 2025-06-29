import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTask, Task, TaskPriority, TaskCategory } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { X, Save, Loader2 } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDueDate?: string | Date;
}

type TaskFormData = {
  title: string;
  description?: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo: string;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, initialDueDate }) => {
  const { addTask, loading } = useTask();
  const { user: currentUser } = useAuth();
  const { staff: staffList, loadingStaff } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>();

  useEffect(() => {
    if (isOpen) {
      // 마감일 설정 - 시간대 문제 해결
      if (initialDueDate) {
        try {
          // Date 객체인 경우와 문자열인 경우 모두 처리
          const date = typeof initialDueDate === 'string' ? new Date(initialDueDate) : initialDueDate;
          
          // 로컬 시간대로 YYYY-MM-DD 형식 생성 (UTC 변환 없이)
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          console.log('📅 날짜 설정:', { originalDate: initialDueDate, formattedDate });
          setValue('dueDate', formattedDate);
        } catch (error) {
          console.error("Error formatting initialDueDate:", error);
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          setValue('dueDate', `${year}-${month}-${day}`);
        }
      } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setValue('dueDate', `${year}-${month}-${day}`);
      }
    } else {
      reset();
      setIsSubmitting(false);
    }
  }, [isOpen, initialDueDate, setValue, reset, currentUser]);

  const onSubmit = async (data: TaskFormData) => {
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedStaff = staffList?.find(staff => staff.id === data.assignedTo);
      
      const newTaskPayload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate).toISOString(),
        startTime: data.startTime,
        endTime: data.endTime,
        priority: data.priority,
        category: data.category,
        status: 'pending', 
        assignedTo: data.assignedTo ? [data.assignedTo] : [],
        assignedToName: selectedStaff ? [selectedStaff.name] : [],
        assignedBy: currentUser.id,
        assignedByName: currentUser.name || 'Unknown User',
      };
      
      console.log('📝 업무 추가 시도:', newTaskPayload);
      
      const taskId = await addTask(newTaskPayload);
      
      if (taskId) {
        console.log('✅ 업무 추가 성공:', taskId);
        reset();
        onClose();
      } else {
        console.error('❌ 업무 추가 실패');
      }
    } catch (error) {
      console.error('업무 추가 중 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: '낮음' },
    { value: 'medium', label: '중간' },
    { value: 'high', label: '높음' },
    { value: 'urgent', label: '긴급' },
  ];

  const categoryOptions: { value: TaskCategory; label: string }[] = [
    { value: 'general', label: '일반' },
    { value: 'maintenance', label: '시설 유지보수' },
    { value: 'administrative', label: '행정' },
    { value: 'client', label: '고객 관련' },
    { value: 'training', label: '교육/훈련' },
  ];

  const activeStaff = staffList?.filter(staff => staff.status === 'active') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700">새 업무 추가</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              업무 제목 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="title"
              control={control}
              rules={{ required: '업무 제목은 필수입니다.' }}
              render={({ field }) => (
                <input
                  {...field}
                  id="title"
                  type="text"
                  className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-slate-300'}`}
                />
              )}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              설명
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="description"
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">
              마감일 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dueDate"
              control={control}
              rules={{ required: '마감일은 필수입니다.' }}
              render={({ field }) => (
                <input
                  {...field}
                  id="dueDate"
                  type="date"
                  className={`w-full p-2 border rounded-md ${errors.dueDate ? 'border-red-500' : 'border-slate-300'}`}
                />
              )}
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">
                시작 시간
              </label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="startTime"
                    type="time"
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">
                종료 시간
              </label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="endTime"
                    type="time"
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
                중요도 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="priority"
                control={control}
                rules={{ required: '중요도는 필수입니다.' }}
                defaultValue="medium"
                render={({ field }) => (
                  <select
                    {...field}
                    id="priority"
                    className={`w-full p-2 border rounded-md ${errors.priority ? 'border-red-500' : 'border-slate-300'}`}
                  >
                    {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                )}
              />
              {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: '카테고리는 필수입니다.' }}
                defaultValue="general"
                render={({ field }) => (
                  <select
                    {...field}
                    id="category"
                    className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-slate-300'}`}
                  >
                    {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                )}
              />
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 mb-1">
              담당자 <span className="text-red-500">*</span>
            </label>
            {loadingStaff ? (
              <div className="w-full p-2 border border-slate-300 rounded-md text-slate-500">
                직원 목록을 불러오는 중...
              </div>
            ) : (
            <Controller
                name="assignedTo"
              control={control}
                rules={{ required: '담당자는 필수입니다.' }}
              render={({ field }) => (
                  <select
                  {...field}
                    id="assignedTo"
                    className={`w-full p-2 border rounded-md ${errors.assignedTo ? 'border-red-500' : 'border-slate-300'}`}
                  >
                    <option value="">담당자를 선택하세요</option>
                    {activeStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} {staff.department && `(${staff.department})`}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}
            {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo.message}</p>}
            {!loadingStaff && activeStaff.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                등록된 직원이 없습니다. 먼저 직원을 등록해주세요.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading || loadingStaff || activeStaff.length === 0}
            >
              {isSubmitting || loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
              업무 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
