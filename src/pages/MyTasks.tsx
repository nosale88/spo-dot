import {
  Bell,
  Megaphone,
  CalendarDays,
  PlusSquare,
  Edit3,
  Trash2,
  GripVertical,
  Save,
  AlertCircle,
  Check,
  X,
  Edit,
  Plus,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useTask, Task, TaskStatus, TaskPriority } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database.types';
import AddTaskModal from '../components/tasks/AddTaskModal';
import TaskDetails from '../components/tasks/TaskDetails';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { parse as dateFnsParse } from 'date-fns/parse'; 
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { ko, Locale } from 'date-fns/locale';
import { getDay } from 'date-fns'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css'; // Import custom calendar styles
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type Handover = Database['public']['Tables']['handovers']['Row'];
type HandoverInput = Database['public']['Tables']['handovers']['Insert'];

const locales = {
  'ko': ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse: (dateStr: string, formatStr: string, locale?: Locale) => dateFnsParse(dateStr, formatStr, new Date(), { locale }), 
  startOfWeek: (date: Date, options?: {locale?: Locale} ) => startOfWeek(date, { locale: options?.locale || (locales.ko as Locale) }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  originalTask: Task;
}

const getPriorityClass = (priority: TaskPriority) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'urgent': return 'bg-purple-600';
    case 'medium': return 'bg-orange-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusDisplayName = (status: TaskStatus) => {
  switch (status) {
    case 'pending': return '대기중';
    case 'in-progress': return '진행중';
    case 'completed': return '완료';
    case 'cancelled': return '취소됨';
    default: return status;
  }
};

const taskStatusOptions: TaskStatus[] = ['pending', 'in-progress', 'completed', 'cancelled'];

type MyTaskView = 'list' | 'month' | 'week' | 'day';

const MyTasks = () => {
  const { tasks: contextTasks, updateTask, deleteTask } = useTask();
  const { user, hasPermission } = useAuth();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MyTaskView>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<string | undefined>(undefined); // For storing date from calendar click

  const [currentHandover, setCurrentHandover] = useState('');
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 업무 상세보기 상태 추가
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  // 업무 클릭 핸들러 추가
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setIsTaskDetailsOpen(false);
    setSelectedTask(null);
  };

  // 현재 사용자에게 배정된 업무만 필터링
  const myTasks = useMemo(() => {
    if (!user) return [];
    
    return contextTasks.filter(task => {
      // assignedTo 배열에 현재 사용자 ID가 포함되어 있는지 확인
      return task.assignedTo && task.assignedTo.includes(user.id);
    });
  }, [contextTasks, user]);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일`;
  
  const calendarEvents = useMemo(() => myTasks.map(task => ({
    id: task.id,
    title: task.title,
    start: parseISO(task.dueDate),
    end: parseISO(task.dueDate),
    allDay: true,
    originalTask: task,
  })), [myTasks]);

  // 인계사항 데이터 가져오기
  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      
      // 로컬 저장소에서 인계사항 가져오기
      const storedHandovers = localStorage.getItem('handovers');
      if (storedHandovers) {
        const parsedHandovers = JSON.parse(storedHandovers);
        // 최근 7일간의 데이터만 필터링
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const filteredHandovers = parsedHandovers.filter((h: Handover) => {
          const handoverDate = new Date(h.date);
          return handoverDate >= sevenDaysAgo;
        });
        
        setHandovers(filteredHandovers);
      } else {
        setHandovers([]);
      }
    } catch (err) {
      console.error('인계사항 불러오기 오류:', err);
      setError('인계사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHandover = async () => {
    if (!currentHandover.trim() || !user) return;
    
    try {
      setSaving(true);
      
      const handoverData: Handover = {
        id: `handover-${Date.now()}`,
        content: currentHandover.trim(),
        date: new Date().toISOString().split('T')[0],
        author_id: user.id,
        author_name: user.name || '알 수 없음',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 기존 인계사항 가져오기
      const storedHandovers = localStorage.getItem('handovers');
      const existingHandovers = storedHandovers ? JSON.parse(storedHandovers) : [];
      
      // 새 인계사항 추가
      const updatedHandovers = [handoverData, ...existingHandovers];
      
      // 로컬 저장소에 저장
      localStorage.setItem('handovers', JSON.stringify(updatedHandovers));
      
      // 성공 시 폼 초기화 및 데이터 새로고침
      setCurrentHandover('');
      await fetchHandovers();
      setSuccess('인계사항이 성공적으로 저장되었습니다.');
      
      // 성공 메시지 자동 제거
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('인계사항 저장 오류:', err);
      setError('인계사항 저장에 실패했습니다.');
      
      // 에러 메시지 자동 제거
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // 오늘 인계사항과 이전 인계사항 분리
  const todayDate = new Date().toISOString().split('T')[0];
  const todayHandovers = handovers.filter(h => h.date === todayDate);
  const previousHandovers = handovers.filter(h => h.date !== todayDate);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!hasPermission('tasks.update')) {
      setError('권한이 없습니다. 업무 상태를 변경할 권한이 없습니다.');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    const taskToUpdate = myTasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      updateTask(taskId, { ...taskToUpdate, status: newStatus, updatedAt: new Date().toISOString() });
      setSuccess('업무 상태가 변경되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    if (!hasPermission('tasks.delete')) {
      setError('권한이 없습니다. 업무 삭제 권한이 없습니다.');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    if (window.confirm('정말로 이 업무를 삭제하시겠습니까?')) {
      deleteTask(taskId);
      setSuccess('업무가 삭제되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!hasPermission('tasks.create')) {
      setError('권한이 없습니다. 업무 생성 권한이 없습니다.');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    const selectedDateStr = slotInfo.start.toISOString().split('T')[0];
    setSelectedDateForNewTask(selectedDateStr);
    setIsAddTaskModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    handleTaskClick(event.originalTask);
  };

  // 주간 뷰용 데이터 생성
  const getWeekTasks = () => {
    const weekStart = startOfWeek(calendarDate);
    const weekEnd = endOfWeek(calendarDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return days.map(day => {
      const dayTasks = myTasks.filter(task => 
        isSameDay(parseISO(task.dueDate), day)
      );
      
      return {
        date: day,
        tasks: dayTasks
      };
    });
  };

  // 일간 뷰용 데이터 생성
  const getDayTasks = () => {
    return myTasks.filter(task => 
      isSameDay(parseISO(task.dueDate), calendarDate)
    );
  };

  // 월간 뷰용 데이터 생성
  const getMonthTasks = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return days.map(day => {
      const dayTasks = myTasks.filter(task => 
        isSameDay(parseISO(task.dueDate), day)
      );
      
      return {
        date: day,
        isCurrentMonth: isSameMonth(day, calendarDate),
        tasks: dayTasks
      };
    });
  };

  // 캘린더 컴포넌트를 위한 CustomMonthDateCell
  const CustomMonthDateCell = ({ children, value: date, className }: { children: React.ReactNode, value: Date, className?: string }) => {
    const dayEvents = calendarEvents.filter(event => {
      const eventStartDate = new Date(event.start);
      return (
        eventStartDate.getFullYear() === date.getFullYear() &&
        eventStartDate.getMonth() === date.getMonth() &&
        eventStartDate.getDate() === date.getDate()
      );
    });

    // Extract the date number node from children
    // The children prop typically contains the date number wrapped in some elements
    
    return (
      <div className={`${className} h-full`}>
        {/* Date number container - positioned absolutely in the top right corner */}
        <div className="absolute top-1 right-2 z-10 font-medium">
          {children}
        </div>
        
        {/* Task list container - starts with enough top padding to avoid the date */}
        <div className="h-full pt-7 px-1 pb-1 relative">
          {dayEvents.length > 0 && (
            <div className="h-full overflow-y-auto task-list-container">
              {dayEvents.map(event => (
                <div 
                  key={event.id} 
                  className="bg-blue-100 text-blue-800 rounded-sm p-1 mb-1 text-xs truncate w-full"
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 캘린더 컴포넌트 설정
  const calendarComponents = useMemo(() => {
    if (currentView === 'month') {
      return {
        dateCellWrapper: CustomMonthDateCell,
      };
    }
    return undefined;
  }, [currentView, calendarEvents]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <CalendarDays className="mr-3 text-blue-600" size={32} />
                내 업무
              </h1>
              <p className="text-slate-600 mt-2">
                {user?.name || '사용자'}님의 배정된 업무를 관리하세요
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  hasPermission('admin.dashboard') 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {hasPermission('admin.dashboard') ? '관리자' : '일반 사용자'}
                </span>
              </p>
            </div>
            
            {/* 날짜 및 알림 */}
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm">{formattedDate}</span>
              <button aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="text-slate-600" size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              {hasPermission('tasks.create') && (
                <button 
                  onClick={() => {
                    setSelectedDateForNewTask(undefined);
                    setIsAddTaskModalOpen(true);
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <PlusSquare size={20} />
                  <span>업무 추가</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 공지사항 */}
        <div className="bg-blue-600 text-white p-4 rounded-xl flex items-center space-x-3 shadow-sm">
          <Megaphone size={24} className="flex-shrink-0" />
          <p className="text-sm font-medium">공지사항: 이번 주 금요일 오후 3시에 전체 회의가 있습니다. 모든 직원은 참석해주세요.</p>
        </div>

        {/* 업무 보기 컨트롤 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 뷰 모드 선택 */}
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
              {(['list', 'month', 'week', 'day'] as MyTaskView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={clsx(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all',
                    currentView === view 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                  )}
                >
                  {view === 'list' ? '목록' : view === 'month' ? '월간' : view === 'week' ? '주간' : '일간'}
                </button>
              ))}
            </div>
            
            {/* 날짜 네비게이션 */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  onChange={(e) => setCalendarDate(parseISO(e.target.value))} 
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                />
              </div>
              {currentView !== 'list' && (
                <button 
                  onClick={() => setCalendarDate(new Date())} 
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  오늘
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 업무 내용 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center mb-4">
              <CalendarDays className="mr-2 text-blue-600" size={20} />
              내 업무 목록
            </h3>

            {currentView === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[35%]">업무</th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">담당자</th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">마감일</th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">중요도</th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">카테고리</th>
                      <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-slate-500">표시할 업무가 없습니다.</td></tr>
                    ) : (
                      myTasks.map((task) => (
                        <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                          <td className="py-3 pr-3">
                            <div className="flex items-center">
                              <GripVertical className="w-5 h-5 text-slate-400 mr-2 opacity-0 group-hover:opacity-100 cursor-grab" />
                                                             <div>
                                 <p 
                                   className="font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                                   onClick={() => handleTaskClick(task)}
                                 >
                                   {task.title}
                                 </p>
                                {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-sm text-slate-700">{Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : task.assignedToName}</td>
                          <td className="py-3 pr-3">
                            <select 
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                              disabled={!hasPermission('tasks.update')}
                              className={`text-sm p-1.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                !hasPermission('tasks.update') ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'
                              }`}
                              title={!hasPermission('tasks.update') ? '업무 수정 권한이 없습니다' : ''}
                            >
                              {taskStatusOptions.map(statusValue => (
                                  <option key={statusValue} value={statusValue}>{getStatusDisplayName(statusValue)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 pr-3 text-sm text-slate-700">
                            {format(parseISO(task.dueDate), 'yyyy-MM-dd')}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block h-3 w-3 rounded-full ${getPriorityClass(task.priority)}`} title={task.priority}></span>
                          </td>
                          <td className="py-3 pr-3 text-sm text-slate-700 text-center">{task.category}</td>
                          <td className="py-3 text-center">
                            {hasPermission('tasks.update') || hasPermission('tasks.delete') ? (
                              <div className="flex justify-center space-x-2">
                                {hasPermission('tasks.update') && (
                                  <button 
                                    onClick={() => {
                                      setEditingTask(task);
                                    }} 
                                    className="text-slate-500 hover:text-blue-600 transition-colors" 
                                    title="수정"
                                  >
                                    <Edit size={14} />
                                  </button>
                                )}
                                {hasPermission('tasks.delete') && (
                                  <button 
                                    onClick={() => {
                                      if (window.confirm('정말로 이 업무를 삭제하시겠습니까?')) {
                                        handleTaskDelete(task.id);
                                      }
                                    }} 
                                    className="text-slate-500 hover:text-red-600 transition-colors" 
                                    title="삭제"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                                  읽기 전용
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : currentView === 'month' ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div key={index} className="py-3 text-center font-semibold text-slate-700 border-r last:border-r-0 border-slate-200">
                      {day}요일
                    </div>
                  ))}
                </div>
                
                {/* 달력 그리드 */}
                <div className="grid grid-cols-7 grid-rows-6 min-h-[600px]" style={{ height: 'calc(100vh - 350px)' }}>
                  {getMonthTasks().map((day, index) => (
                    <div 
                      key={index} 
                      className={clsx(
                        "border-r border-b last:border-r-0 border-slate-200 p-2 overflow-hidden relative",
                        !day.isCurrentMonth && "bg-slate-50",
                        isSameDay(day.date, new Date()) && "bg-blue-50 ring-1 ring-blue-200"
                      )}
                    >
                      {/* 날짜와 업무 추가 버튼 */}
                      <div className="flex justify-between items-center mb-2">
                        <span 
                          className={clsx(
                            "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium cursor-pointer transition-colors",
                            isSameDay(day.date, new Date()) 
                              ? "bg-blue-600 text-white" 
                              : day.isCurrentMonth 
                                ? "text-slate-900 hover:bg-slate-100" 
                                : "text-slate-400"
                          )}
                        >
                          {format(day.date, 'd')}
                        </span>
                        
                        {day.isCurrentMonth && hasPermission('tasks.create') && (
                          <button 
                            className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-300 hover:border-blue-600 p-1.5 rounded-lg transition-all hover:scale-110 shadow-sm"
                            onClick={() => {
                              // 로컬 시간대를 유지하여 정확한 날짜 전달
                              const year = day.date.getFullYear();
                              const month = String(day.date.getMonth() + 1).padStart(2, '0');
                              const dayStr = String(day.date.getDate()).padStart(2, '0');
                              const selectedDateStr = `${year}-${month}-${dayStr}`;
                              console.log('📅 월간 뷰 업무 추가 날짜:', { originalDate: day.date, selectedDateStr });
                              setSelectedDateForNewTask(selectedDateStr);
                              setIsAddTaskModalOpen(true);
                            }}
                            title="업무 추가"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                      
                      {/* 업무 목록 */}
                      <div className="space-y-1 max-h-24 overflow-hidden">
                        {day.tasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className={clsx(
                              "p-1.5 text-xs rounded cursor-pointer text-white font-medium truncate transition-opacity hover:opacity-80",
                              task.priority === 'urgent' && "bg-purple-500",
                              task.priority === 'high' && "bg-red-500",
                              task.priority === 'medium' && "bg-orange-500",
                              task.priority === 'low' && "bg-green-500",
                              !task.priority && "bg-blue-500",
                              task.status === 'completed' && "opacity-60"
                            )}
                            onClick={() => handleTaskClick(task)}
                            title={`${task.title} (${task.status})`}
                          >
                            <span className="flex items-center">
                              <span className="ml-1">
                                {task.title}
                              </span>
                            </span>
                          </div>
                        ))}
                        
                        {day.tasks.length > 3 && (
                          <div className="text-xs text-center text-slate-500 cursor-pointer hover:text-blue-600 font-medium py-1">
                            +{day.tasks.length - 3}개 더
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentView === 'week' ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* 주간 헤더 */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                  {getWeekTasks().map((day, index) => (
                    <div 
                      key={index} 
                      className={clsx(
                        "py-4 px-2 text-center font-medium border-r last:border-r-0 border-slate-200",
                        isSameDay(day.date, new Date()) && "bg-blue-50 border-blue-200"
                      )}
                    >
                      <p className="text-sm text-slate-500 mb-1">
                        {format(day.date, 'EEEE', { locale: ko })}
                      </p>
                      <p className={clsx(
                        "text-lg font-semibold",
                        isSameDay(day.date, new Date()) 
                          ? "text-blue-600" 
                          : "text-slate-900"
                      )}>
                        {format(day.date, 'd')}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* 주간 캘린더 그리드 */}
                <div className="grid grid-cols-7 min-h-[500px]" style={{ height: 'calc(100vh - 400px)' }}>
                  {getWeekTasks().map((day, index) => (
                    <div 
                      key={index} 
                      className={clsx(
                        "border-r last:border-r-0 border-slate-200 p-3 overflow-y-auto",
                        isSameDay(day.date, new Date()) && "bg-blue-50/30"
                      )}
                    >
                      <div className="space-y-2">
                        {day.tasks.map(task => (
                          <div 
                            key={task.id}
                            className={clsx(
                              "p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-sm",
                              task.status === 'completed' 
                                ? "border-green-200 bg-green-50" 
                                : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={clsx(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                task.priority === 'urgent' && "bg-purple-100 text-purple-800",
                                task.priority === 'high' && "bg-red-100 text-red-800",
                                task.priority === 'medium' && "bg-orange-100 text-orange-800",
                                task.priority === 'low' && "bg-green-100 text-green-800",
                                !task.priority && "bg-blue-100 text-blue-800"
                              )}>
                                {task.priority === 'urgent' ? '긴급' : 
                                 task.priority === 'high' ? '높음' : 
                                 task.priority === 'medium' ? '보통' : 
                                 task.priority === 'low' ? '낮음' : '기본'}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-sm text-slate-900 truncate mb-1">{task.title}</h4>
                            
                            <div className="text-xs text-slate-600">
                              마감일: {format(parseISO(task.dueDate), 'MM-dd')}
                            </div>
                            
                            <div className="text-xs text-slate-500 mt-1">
                              상태: {getStatusDisplayName(task.status)}
                            </div>
                          </div>
                        ))}
                        
                        {day.tasks.length === 0 && hasPermission('tasks.create') && (
                          <div 
                            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all hover:scale-105 group"
                            onClick={() => {
                              // 로컬 시간대를 유지하여 정확한 날짜 전달
                              const year = day.date.getFullYear();
                              const month = String(day.date.getMonth() + 1).padStart(2, '0');
                              const dayStr = String(day.date.getDate()).padStart(2, '0');
                              const selectedDateStr = `${year}-${month}-${dayStr}`;
                              console.log('📅 주간 뷰 업무 추가 날짜:', { originalDate: day.date, selectedDateStr });
                              setSelectedDateForNewTask(selectedDateStr);
                              setIsAddTaskModalOpen(true);
                            }}
                          >
                            <Plus size={24} className="text-blue-500 mb-2 group-hover:text-blue-600" />
                            <span className="text-blue-600 text-sm font-medium text-center group-hover:text-blue-700">
                              업무 추가
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentView === 'day' ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* 일간 헤더 */}
                <div className="border-b border-slate-200 bg-slate-50 p-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {format(calendarDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      총 {getDayTasks().length}개의 업무
                    </p>
                  </div>
                </div>
                
                {/* 일간 업무 목록 */}
                <div className="p-6">
                  {getDayTasks().length === 0 ? (
                    <div className="py-12 text-center">
                      <CalendarDays className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 mb-2">업무가 없습니다</h4>
                      <p className="text-slate-500 mb-4">이 날짜에 예정된 업무가 없습니다.</p>
                      {hasPermission('tasks.create') && (
                        <button 
                          onClick={() => {
                            // 로컬 시간대를 유지하여 정확한 날짜 전달
                            const year = calendarDate.getFullYear();
                            const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
                            const dayStr = String(calendarDate.getDate()).padStart(2, '0');
                            const selectedDateStr = `${year}-${month}-${dayStr}`;
                            console.log('📅 일간 뷰 업무 추가 날짜:', { originalDate: calendarDate, selectedDateStr });
                            setSelectedDateForNewTask(selectedDateStr);
                            setIsAddTaskModalOpen(true);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus size={16} className="mr-1.5" />
                          업무 추가하기
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {getDayTasks().map(task => (
                        <div 
                          key={task.id}
                          className={clsx(
                            "p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-sm",
                            task.status === 'completed' 
                              ? "border-green-200 bg-green-50" 
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                task.priority === 'urgent' && "bg-purple-100 text-purple-800",
                                task.priority === 'high' && "bg-red-100 text-red-800",
                                task.priority === 'medium' && "bg-orange-100 text-orange-800",
                                task.priority === 'low' && "bg-green-100 text-green-800",
                                !task.priority && "bg-blue-100 text-blue-800"
                              )}>
                                {task.priority === 'urgent' ? '긴급' : 
                                 task.priority === 'high' ? '높음' : 
                                 task.priority === 'medium' ? '보통' : 
                                 task.priority === 'low' ? '낮음' : '기본'}
                              </span>
                              
                              <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                task.status === 'completed' && "bg-green-100 text-green-800",
                                task.status === 'in-progress' && "bg-blue-100 text-blue-800",
                                task.status === 'pending' && "bg-yellow-100 text-yellow-800",
                                task.status === 'cancelled' && "bg-red-100 text-red-800"
                              )}>
                                {getStatusDisplayName(task.status)}
                              </span>
                            </div>
                          </div>
                          
                          <h4 className="font-semibold text-lg text-slate-900 mb-2">{task.title}</h4>
                          
                          {task.description && (
                            <p className="text-slate-600 mb-3">{task.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>마감일: {format(parseISO(task.dueDate), 'yyyy-MM-dd')}</span>
                            <span>생성일: {format(parseISO(task.createdAt), 'yyyy-MM-dd')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg" style={{ height: 'calc(100vh - 280px)' }}>
                <Calendar<CalendarEvent>
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  titleAccessor="title"
                  style={{ height: '100%' }}
                  date={calendarDate}
                  onNavigate={(newDate) => setCalendarDate(newDate)}
                  onView={(newView) => setCurrentView(newView as MyTaskView)}
                  view={currentView as Exclude<MyTaskView, 'list'>}
                  messages={{
                    allDay: '하루 종일',
                    previous: '이전',
                    next: '다음',
                    today: '오늘',
                    month: '월',
                    week: '주',
                    day: '일',
                    agenda: '목록',
                    date: '날짜',
                    time: '시간',
                    event: '이벤트',
                    noEventsInRange: '이 범위에는 업무가 없습니다.',
                    showMore: total => `+${total} 더보기`,
                  }}
                  selectable 
                  onSelectSlot={handleSelectSlot} 
                  onSelectEvent={handleEventClick}
                  components={calendarComponents} 
                  className="rbc-calendar-main"
                />
              </div>
            )}
          </div>
        </div>

        {/* 에러 및 성공 메시지 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
            >
              <AlertCircle className="text-red-500 mr-3" size={20} />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
            >
              <Check className="text-green-500 mr-3" size={20} />
              <span className="text-green-700">{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

                {/* 인계사항 섹션 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 금일 인계사항 작성 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
          <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            <Edit3 className="mr-2 text-blue-600" size={20} />
            금일 인계사항 작성
          </h2>
          
          {/* 오늘 작성된 인계사항이 있으면 표시 */}
          {todayHandovers.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">오늘 작성된 인계사항:</p>
              {todayHandovers.map((handover) => (
                <div key={handover.id} className="mb-2 last:mb-0">
                  <p className="text-sm text-blue-700">{handover.content}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {handover.author_name} - {new Date(handover.created_at || '').toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <textarea
            value={currentHandover}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setCurrentHandover(e.target.value);
              }
            }}
            rows={5}
            placeholder="오늘 처리해야 할 인계사항을 입력하세요..."
            className={clsx(
              "w-full p-3 border rounded-lg text-sm resize-none transition-colors",
              currentHandover.length > 450 
                ? "border-orange-300 focus:ring-orange-500 focus:border-orange-500" 
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            disabled={saving}
          />
          <div className="mt-4 flex justify-between items-center">
            <span className={clsx(
              "text-xs",
              currentHandover.length > 450 
                ? "text-orange-600 font-medium" 
                : currentHandover.length > 400 
                  ? "text-yellow-600" 
                  : "text-slate-500"
            )}>
              {currentHandover.length}/500자
              {currentHandover.length > 450 && (
                <span className="ml-1 text-orange-500">
                  ({500 - currentHandover.length}자 남음)
                </span>
              )}
            </span>
            <button
              onClick={handleSaveHandover}
              disabled={!currentHandover.trim() || saving || currentHandover.length > 500}
              className={clsx(
                'font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2',
                !currentHandover.trim() || saving || currentHandover.length > 500
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
              )}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>저장중...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>저장</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 이전 인계사항 */}
                  <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
          <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            <CalendarDays className="mr-2 text-purple-600" size={20} />
            이전 인계사항
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : previousHandovers.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {previousHandovers.map((handover, index) => (
                  <motion.div
                    key={handover.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <p className="text-sm text-slate-800 leading-relaxed">{handover.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-slate-500">
                        {handover.author_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(handover.date)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">이전 인계사항이 없습니다.</p>
            </div>
                      )}
          </motion.div>
        </section>
      </div>

      {isAddTaskModalOpen && (
        <AddTaskModal 
          isOpen={isAddTaskModalOpen} 
          onClose={() => setIsAddTaskModalOpen(false)}
          initialDueDate={selectedDateForNewTask} // Pass selected date to modal
        />
      )}

      {/* 업무 수정 모달 */}
      {editingTask && (
        <EditTaskModal 
          task={editingTask}
          isOpen={!!editingTask} 
          onClose={() => setEditingTask(null)}
          onSave={(updates: Partial<Task>) => {
            updateTask(editingTask.id, updates);
            setEditingTask(null);
          }}
        />
      )}

      {/* 업무 상세보기 모달 */}
      {selectedTask && isTaskDetailsOpen && (
        <TaskDetails
          task={selectedTask}
          onClose={handleCloseTaskDetails}
        />
      )}
    </div>
  );
};

// Simple edit modal component to avoid import issues
const EditTaskModal = ({ task, isOpen, onClose, onSave }: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">업무 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyTasks;
