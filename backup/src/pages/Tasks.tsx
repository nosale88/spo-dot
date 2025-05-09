import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, CheckSquare, Clock, AlertTriangle, Calendar, User, Tag, MoreHorizontal } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import clsx from 'clsx';

// 업무 우선순위
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// 업무 상태
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// 업무 카테고리
type TaskCategory = 'maintenance' | 'administrative' | 'client' | 'training' | 'general';

// 업무 인터페이스
interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: Date;
  createdAt: Date;
  assignedTo: string;
  assignedBy: string;
  completedAt?: Date;
}

// 임시 업무 데이터 생성
const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  
  const titles = [
    '장비 유지보수: 트레드밀 #3',
    '신규 PT 플랜 작성',
    '회원 상담: 김영희',
    '월간 보고서 작성',
    '신규 트레이너 교육',
    '고객 출석 기록 검토',
    '영양 상담: 이철수',
    '시설 청소 일정 관리',
    '재고 관리: 단백질 보충제',
    '마케팅 계획 검토',
    '홍보 이벤트 준비',
    '프로그램 개발: 시니어 피트니스'
  ];
  
  const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed', 'cancelled'];
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  const categories: TaskCategory[] = ['maintenance', 'administrative', 'client', 'training', 'general'];
  const assignees = ['김철수', '이영희', '박지민', '최준호'];
  
  const today = new Date();
  
  for (let i = 0; i < 15; i++) {
    const createdAt = new Date(today);
    createdAt.setDate(today.getDate() - Math.floor(Math.random() * 14));
    
    const dueDate = new Date(createdAt);
    dueDate.setDate(createdAt.getDate() + Math.floor(Math.random() * 14) + 1);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let completedAt;
    if (status === 'completed') {
      completedAt = new Date(dueDate);
      completedAt.setDate(dueDate.getDate() - Math.floor(Math.random() * 3));
    }
    
    tasks.push({
      id: i + 1,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: Math.random() > 0.3 ? '이 업무는 정해진 기한 내에 완료해야 합니다. 필요한 자료를 사전에 준비해주세요.' : undefined,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      dueDate,
      createdAt,
      assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
      assignedBy: '관리자',
      completedAt
    });
  }
  
  return tasks;
};

const Tasks = () => {
  const [tasks] = useState<Task[]>(generateTasks());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  
  // 필터링 적용
  useEffect(() => {
    let result = tasks;
    
    // 검색어 필터링
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // 상태 필터링
    if (filterStatus !== 'all') {
      result = result.filter(task => task.status === filterStatus);
    }
    
    // 우선순위 필터링
    if (filterPriority !== 'all') {
      result = result.filter(task => task.priority === filterPriority);
    }
    
    // 카테고리 필터링
    if (filterCategory !== 'all') {
      result = result.filter(task => task.category === filterCategory);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, filterStatus, filterPriority, filterCategory]);
  
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
  
  // 카테고리 아이콘
  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'maintenance':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>;
      case 'administrative':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>;
      case 'client':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>;
      case 'training':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>;
      case 'general':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>;
    }
  };
  
  // 우선순위 아이콘
  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'high':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
          <path d="m3 7 5 5-5 5V7" />
          <path d="m14 7 5 5-5 5V7" />
        </svg>;
      case 'medium':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
          <path d="M3 7h18" />
          <path d="M3 12h18" />
          <path d="M3 17h18" />
        </svg>;
      case 'low':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <path d="m3 7 5 5-5 5V7" />
        </svg>;
    }
  };
  
  // 마감일 텍스트
  const getDueDateText = (date: Date) => {
    if (isPast(date) && !isToday(date)) {
      return <span className="text-red-500">기한 초과</span>;
    } else if (isToday(date)) {
      return <span className="text-orange-500">오늘 마감</span>;
    } else if (isTomorrow(date)) {
      return <span className="text-yellow-500">내일 마감</span>;
    } else {
      return format(date, 'yyyy-MM-dd');
    }
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
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="업무명, 담당자로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 py-2 text-sm w-full"
            />
          </div>
          
          <button className="btn btn-outline inline-flex items-center">
            <Filter size={16} className="mr-2" />
            필터
          </button>
          
          <button className="btn btn-primary inline-flex items-center">
            <Plus size={16} className="mr-2" />
            업무 추가
          </button>
        </div>
      </div>
      
      {/* 필터 탭 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 상태 필터 */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">상태</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              전체
            </button>
            {(['pending', 'in-progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : `${getStatusBadgeStyle(status)}`
                )}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
        
        {/* 우선순위 필터 */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">우선순위</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterPriority('all')}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                filterPriority === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              전체
            </button>
            {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                  filterPriority === priority
                    ? 'bg-primary text-white'
                    : `${getPriorityBadgeStyle(priority)}`
                )}
              >
                {getPriorityText(priority)}
              </button>
            ))}
          </div>
        </div>
        
        {/* 카테고리 필터 */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">카테고리</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                filterCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              전체
            </button>
            {(['maintenance', 'administrative', 'client', 'training', 'general'] as TaskCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                  filterCategory === category
                    ? 'bg-primary text-white'
                    : `${getCategoryBadgeStyle(category)}`
                )}
              >
                {getCategoryText(category)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 업무 목록 */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-primary" />
            업무 목록
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">총 {filteredTasks.length}개 업무</p>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                transition={{ duration: 0.2 }}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex justify-between mb-2">
                  <div className="flex items-start">
                    <div 
                      className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 mr-3 ${
                        task.status === 'pending' ? 'bg-yellow-400' :
                        task.status === 'in-progress' ? 'bg-blue-400' :
                        task.status === 'completed' ? 'bg-green-400' :
                        'bg-slate-400'
                      }`}
                    />
                    <div>
                      <h3 className={`font-medium ${
                        task.status === 'completed' || task.status === 'cancelled'
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <MoreHorizontal size={18} className="text-slate-400" />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg ${getStatusBadgeStyle(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg ${getPriorityBadgeStyle(task.priority)}`}>
                    {getPriorityIcon(task.priority)}
                    <span className="ml-1">{getPriorityText(task.priority)}</span>
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg ${getCategoryBadgeStyle(task.category)}`}>
                    {getCategoryIcon(task.category)}
                    <span className="ml-1">{getCategoryText(task.category)}</span>
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center mr-4">
                    <User size={14} className="mr-1" />
                    <span>{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{getDueDateText(task.dueDate)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckSquare size={48} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">업무 없음</h3>
              <p className="text-slate-500 dark:text-slate-400">
                현재 필터 조건에 맞는 업무가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* 선택된 업무 상세 정보 */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  업무 상세 정보
                </h2>
                <div className="flex gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg ${getStatusBadgeStyle(selectedTask.status)}`}>
                    {getStatusText(selectedTask.status)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg ${getPriorityBadgeStyle(selectedTask.priority)}`}>
                    {getPriorityText(selectedTask.priority)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {selectedTask.title}
              </h3>
              
              {selectedTask.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">설명</h4>
                  <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                    {selectedTask.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">담당자</h4>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-2">
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {selectedTask.assignedTo.charAt(0)}
                      </span>
                    </div>
                    <span className="text-slate-900 dark:text-white">{selectedTask.assignedTo}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">카테고리</h4>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-lg ${getCategoryBadgeStyle(selectedTask.category)}`}>
                      {getCategoryIcon(selectedTask.category)}
                      <span className="ml-1">{getCategoryText(selectedTask.category)}</span>
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">마감일</h4>
                  <div className="flex items-center">
                    <Calendar size={16} className="text-slate-400 mr-2" />
                    <span className="text-slate-900 dark:text-white">
                      {format(selectedTask.dueDate, 'yyyy년 MM월 dd일')}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">생성일</h4>
                  <div className="flex items-center">
                    <Calendar size={16} className="text-slate-400 mr-2" />
                    <span className="text-slate-900 dark:text-white">
                      {format(selectedTask.createdAt, 'yyyy년 MM월 dd일')}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedTask.status === 'completed' && selectedTask.completedAt && (
                <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckSquare size={18} className="text-green-500 mr-2" />
                    <span className="text-green-800 dark:text-green-300">
                      {format(selectedTask.completedAt, 'yyyy년 MM월 dd일')}에 완료됨
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex space-x-3">
                <button className="btn btn-primary">업무 수정</button>
                {selectedTask.status !== 'completed' && (
                  <button className="btn btn-outline inline-flex items-center">
                    <CheckSquare size={16} className="mr-2" />
                    완료로 표시
                  </button>
                )}
                {selectedTask.status !== 'cancelled' && (
                  <button className="btn btn-outline text-red-500 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
                    취소
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Tasks;