import React, { useState } from 'react';
import { useTask, Task, TaskStatus, TaskPriority } from '../../contexts/TaskContext';
import { useNotification } from '../../contexts/NotificationContext';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate, { AdminOnly, CanCreateTasks } from '../../components/auth/PermissionGate';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, PlusSquare, X, Shield } from 'lucide-react';
import AddTaskModal from '../../components/tasks/AddTaskModal';

// AllTasks.tsx 또는 MyTasks.tsx 에서 가져온 헬퍼 함수들 (Task 컨텍스트 타입 기반)
const getPriorityClass = (priority: TaskPriority | undefined) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'urgent': return 'bg-purple-600';
    case 'medium': return 'bg-orange-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusDisplayName = (status: TaskStatus | undefined) => {
  switch (status) {
    case 'pending': return '대기중';
    case 'in-progress': return '진행중';
    case 'completed': return '완료';
    case 'cancelled': return '취소됨';
    default: return status || 'N/A';
  }
};

const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case 'maintenance': return '유지보수';
    case 'client': return '고객';
    case 'administrative': return '행정';
    case 'training': return '트레이닝';
    case 'general': return '일반';
    default: return category;
  }
};

const AdminTaskManagement: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const { showToast } = useNotification();
  const { 
    checkPermission, 
    executeWithPermission,
    isAdmin 
  } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignedToName: [],
    dueDate: '',
    priority: 'medium',
    status: 'pending',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'assignedToName') {
      if (isEditModalOpen && editingTask) {
        setEditingTask(prev => prev ? { ...prev, [name]: value ? [value] : [] } : null);
      } else {
        setNewTaskData(prev => ({ ...prev, [name]: value ? [value] : [] }));
      }
    } else {
      if (isEditModalOpen && editingTask) {
        setEditingTask(prev => prev ? { ...prev, [name]: value } : null);
      } else {
        setNewTaskData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const dateValue = value ? new Date(value).toISOString() : '';
    if (isEditModalOpen && editingTask) {
      setEditingTask(prev => prev ? { ...prev, [name]: dateValue } : null);
    } else {
      setNewTaskData(prev => ({ ...prev, [name]: dateValue }));
    }
  };

  const resetNewTaskData = () => {
    setNewTaskData({
      title: '',
      description: '',
      assignedToName: [],
      dueDate: '',
      priority: 'medium',
      status: 'pending',
    });
  }

  const handleAddTask = async () => {
    if (!newTaskData.title || !newTaskData.dueDate) {
      showToast('warning', '필수 항목 누락', '업무명과 마감일은 필수 항목입니다.');
      return;
    }

    const result = await executeWithPermission(
      'tasks.create',
      async () => {
        await addTask({
          ...newTaskData,
        } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
        setIsModalOpen(false);
        resetNewTaskData();
        showToast('success', '업무 추가 완료', '새로운 업무가 성공적으로 추가되었습니다.');
      },
      '업무를 생성할 권한이 없습니다.'
    );

    if (!result) {
      console.error('Permission denied for task creation');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task, assignedToName: task.assignedToName || [] });
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    if (!editingTask.title || !editingTask.dueDate) {
      showToast('warning', '필수 항목 누락', '업무명과 마감일은 필수 항목입니다.');
      return;
    }

    const result = await executeWithPermission(
      'tasks.update',
      async () => {
        await updateTask(editingTask.id, editingTask);
        setIsEditModalOpen(false);
        setEditingTask(null);
        showToast('success', '업무 수정 완료', '업무가 성공적으로 수정되었습니다.');
      },
      '업무를 수정할 권한이 없습니다.'
    );

    if (!result) {
      console.error('Permission denied for task update');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!checkPermission('tasks.delete')) {
      return;
    }

    if (window.confirm('정말로 이 업무를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const result = await executeWithPermission(
        'tasks.delete',
        async () => {
          await deleteTask(taskId);
          showToast('success', '업무 삭제 완료', '업무가 성공적으로 삭제되었습니다.');
        },
        '업무를 삭제할 권한이 없습니다.'
      );

      if (!result) {
        console.error('Permission denied for task deletion');
      }
    }
  };

  // 관리자 권한 확인
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-slate-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">업무 관리 (관리자)</h1>
        <CanCreateTasks>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center shadow-md transition-colors">
            <PlusSquare size={20} className="mr-2" />
            새 업무 추가
          </button>
        </CanCreateTasks>
      </header>
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">전체 업무 목록</h2>
        
        {tasks.length === 0 ? (
          <p className="text-slate-500">등록된 업무가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">제목</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">담당자</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">마감일</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">우선순위</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">생성일</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">카테고리</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900 max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{(task.assignedToName && task.assignedToName.length > 0) ? task.assignedToName.join(', ') : 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityClass(task.priority)} text-white`}>
                        {task.priority === 'urgent' ? '긴급' :
                         task.priority === 'high' ? '높음' :
                         task.priority === 'medium' ? '보통' :
                         task.priority === 'low' ? '낮음' : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{getStatusDisplayName(task.status)}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{task.createdAt ? format(parseISO(task.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{getCategoryDisplayName(task.category || 'general')}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="수정"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* 업무 수정 모달 */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">업무 수정</h3>
              <button onClick={() => { setIsEditModalOpen(false); setEditingTask(null); }} className="text-slate-500 hover:text-slate-700">
                <X size={28} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700 mb-1">업무명 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  id="edit-title" 
                  value={editingTask.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                <textarea 
                  name="description" 
                  id="edit-description" 
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-assignedToName" className="block text-sm font-medium text-slate-700 mb-1">담당자명</label>
                  <input 
                    type="text" 
                    name="assignedToName" 
                    id="edit-assignedToName" 
                    value={editingTask.assignedToName && editingTask.assignedToName.length > 0 ? editingTask.assignedToName.join(', ') : ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-dueDate" className="block text-sm font-medium text-slate-700 mb-1">마감일 <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    id="edit-dueDate" 
                    value={editingTask.dueDate ? format(parseISO(editingTask.dueDate), 'yyyy-MM-dd') : ''}
                    onChange={handleDateChange} 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-priority" className="block text-sm font-medium text-slate-700 mb-1">중요도</label>
                  <select 
                    name="priority" 
                    id="edit-priority" 
                    value={editingTask.priority}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">중간</option>
                    <option value="high">높음</option>
                    <option value="urgent">긴급</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                  <select 
                    name="status" 
                    id="edit-status" 
                    value={editingTask.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="pending">대기중</option>
                    <option value="in-progress">진행중</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소됨</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => { setIsEditModalOpen(false); setEditingTask(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                취소
              </button>
              <button 
                type="button" 
                onClick={handleUpdateTask}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                변경사항 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskManagement;
