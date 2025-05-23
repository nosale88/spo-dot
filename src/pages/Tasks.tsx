import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, CheckSquare, Clock, AlertTriangle, Calendar, User, Tag, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx';
import { useTask, Task, TaskPriority, TaskStatus, TaskCategory } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import AddTaskForm from '../components/forms/AddTaskForm';
import TaskDetails from '../components/tasks/TaskDetails';

const Tasks = () => {
  const { user } = useAuth();
  const { tasks, filteredTasks, filterTasks, updateTask } = useTask();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // 필터링 적용
  useEffect(() => {
    filterTasks({
      status: filterStatus,
      priority: filterPriority,
      category: filterCategory,
      searchQuery,
      assignedTo: user?.role !== 'admin' ? user?.id : undefined
    });
  }, [tasks, searchQuery, filterStatus, filterPriority, filterCategory, user]);
  
  // 우선순위에 따른 배지 스타일
  const getPriorityBadgeStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };
  
  // 상태에 따른 배지 스타일
  const getStatusBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  // 카테고리에 따른 배지 스타일
  const getCategoryBadgeStyle = (category: TaskCategory) => {
    switch (category) {
      case 'maintenance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'administrative':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'client':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'training':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'general':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  // 우선순위 텍스트
  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'medium': return '중간';
      case 'high': return '높음';
      case 'urgent': return '긴급';
    }
  };
  
  // 상태 텍스트
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'in-progress': return '진행중';
      case 'completed': return '완료됨';
      case 'cancelled': return '취소됨';
    }
  };
  
  // 카테고리 텍스트
  const getCategoryText = (category: TaskCategory) => {
    switch (category) {
      case 'maintenance': return '유지보수';
      case 'administrative': return '행정';
      case 'client': return '고객';
      case 'training': return '교육';
      case 'general': return '일반';
    }
  };
  
  // 마감일 텍스트
  const getDueDateText = (dateISO: string) => {
    const date = parseISO(dateISO);
    
    if (isToday(date)) return '오늘';
    if (isTomorrow(date)) return '내일';
    
    return format(date, 'M월 d일', { locale: ko });
  };
  
  // 빠른 상태 변경
  const handleQuickStatusChange = (task: Task, status: TaskStatus) => {
    updateTask(task.id, { status });
  };
  
  // 업무 카드 배경색
  const getTaskCardClass = (task: Task) => {
    if (task.status === 'completed') {
      return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30';
    }
    
    if (task.status === 'cancelled') {
      return 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700';
    }
    
    if (isPast(parseISO(task.dueDate)) && task.status !== 'completed' && task.status !== 'cancelled') {
      return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30';
    }
    
    return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">업무 관리</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="업무 또는 담당자 검색"
              className="form-input pl-10 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline inline-flex items-center"
          >
            <Filter size={16} className="mr-2" />
            필터
            {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus size={16} className="mr-2" />
            업무 추가
          </button>
        </div>
      </div>
      
      {/* 필터 패널 */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                상태
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 상태</option>
                <option value="pending">대기중</option>
                <option value="in-progress">진행중</option>
                <option value="completed">완료됨</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                우선순위
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 우선순위</option>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                카테고리
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 카테고리</option>
                <option value="general">일반</option>
                <option value="maintenance">유지보수</option>
                <option value="administrative">행정</option>
                <option value="client">고객</option>
                <option value="training">교육</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 업무 목록 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id}
              className={clsx(
                "border rounded-lg p-4 shadow-sm transition-colors hover:shadow cursor-pointer",
                getTaskCardClass(task)
              )}
              onClick={() => {
                setSelectedTask(task);
                setShowTaskDetails(true);
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-start space-x-2">
                  {/* 우선순위 아이콘 */}
                  <div className={clsx(
                    "h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center",
                    task.priority === 'urgent' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                    task.priority === 'high' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
                    task.priority === 'medium' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                    task.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  )}>
                    <AlertTriangle size={20} />
                  </div>
                  
                  {/* 업무 제목과 배지들 */}
                  <div className="flex-1">
                    <h3 className={clsx(
                      "text-lg font-semibold",
                      task.status === 'completed' || task.status === 'cancelled'
                        ? "text-slate-500 dark:text-slate-400" 
                        : "text-slate-900 dark:text-white"
                    )}>
                      {task.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusBadgeStyle(task.status)
                      )}>
                        {getStatusText(task.status)}
                      </span>
                      
                      <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getPriorityBadgeStyle(task.priority)
                      )}>
                        {getPriorityText(task.priority)}
                      </span>
                      
                      <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getCategoryBadgeStyle(task.category)
                      )}>
                        {getCategoryText(task.category)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 날짜 및 담당자 정보 */}
                <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Calendar size={16} className="mr-1.5" />
                    <span className={clsx(
                      "text-sm",
                      isPast(parseISO(task.dueDate)) && task.status !== 'completed' && task.status !== 'cancelled' && "text-red-600 dark:text-red-400"
                    )}>
                      {getDueDateText(task.dueDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <User size={16} className="mr-1.5" />
                    <span className="text-sm">{Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : task.assignedToName}</span>
                  </div>
                  
                  {/* 빠른 상태 변경 버튼 */}
                  {task.status !== 'completed' && task.status !== 'cancelled' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatusChange(task, 'completed');
                      }}
                      className="p-1.5 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-100 dark:hover:text-green-400 dark:hover:bg-green-900/30"
                      title="완료로 표시"
                    >
                      <CheckSquare size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* 업무 설명 (짧게 표시) */}
              {task.description && (
                <div className="mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{task.description}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <CheckSquare size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">업무가 없습니다</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                ? '필터 조건에 맞는 업무가 없습니다. 필터를 변경해보세요.'
                : '새 업무를 추가하여 시작해보세요.'}
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              업무 추가
            </button>
          </div>
        )}
      </div>
      
      {/* 업무 추가 폼 */}
      {showAddForm && (
        <AddTaskForm onClose={() => setShowAddForm(false)} />
      )}
      
      {/* 업무 상세 정보 */}
      {showTaskDetails && selectedTask && (
        <TaskDetails 
          task={selectedTask} 
          onClose={() => setShowTaskDetails(false)} 
        />
      )}
    </motion.div>
  );
};

export default Tasks;