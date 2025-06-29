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
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useTask, Task, TaskStatus, TaskPriority } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { useHandover } from '../contexts/HandoverContext';
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
  const { handovers, loading: handoversLoading, error: handoversError, addHandover } = useHandover();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MyTaskView>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<string | undefined>(undefined); // For storing date from calendar click

  const [currentHandover, setCurrentHandover] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);


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

  const handleSaveHandover = async () => {
    if (!currentHandover.trim() || !user) return;
    
    try {
      setSaving(true);
      
      const result = await addHandover(currentHandover.trim());
      
      if (result) {
        // 성공 시 폼 초기화
      setCurrentHandover('');
      setSuccess('인계사항이 성공적으로 저장되었습니다.');
      
      // 성공 메시지 자동 제거
      setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('인계사항 저장에 실패했습니다.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      logger.error('인계사항 저장 오류', err);
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
    
    confirmDelete('업무').then((confirmed) => {
      if (confirmed) {
        deleteTask(taskId);
        showSuccess('업무가 삭제되었습니다.');
      }
    });
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

  // 일간 보기용 타임테이블 데이터 생성
  const getDailyTimetable = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const selectedDate = format(calendarDate, 'yyyy-MM-dd');
    
    // 선택된 날짜의 업무만 필터링
    const dayTasks = myTasks.filter(task => {
      const taskDate = format(parseISO(task.dueDate), 'yyyy-MM-dd');
      return taskDate === selectedDate;
    });

    return hours.map(hour => {
      const hourString = hour.toString().padStart(2, '0');
      const hourTasks = dayTasks.filter(task => {
        if (!task.startTime) return false;
        const taskHour = parseInt(task.startTime.split(':')[0]);
        return taskHour === hour;
      });

      return {
        hour,
        hourString: `${hourString}:00`,
        tasks: hourTasks
      };
    });
  };

  const timetableData = getDailyTimetable();

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
            )}
            
            {/* 권한이 없는 경우 안내 메시지 */}
            {user && !hasPermission('tasks.create') && (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                업무 추가 권한이 없습니다 (현재 역할: {user.role})
              </div>
            )}
          </div>
        </div>

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
          
          {handoversLoading ? (
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
          onClose={() => {
            logger.debug('모달 닫기 클릭됨');
            setEditingTask(null);
          }}
          onSave={(updates: Partial<Task>) => {
            logger.debug('업무 저장:', updates);
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

// 업무 상세보기/수정 모달 컴포넌트
const EditTaskModal = ({ task, isOpen, onClose, onSave }: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [startTime, setStartTime] = useState(task.startTime || '');
  const [endTime, setEndTime] = useState(task.endTime || '');
  const { hasPermission } = useAuth();

  if (!isOpen) {
    logger.debug('EditTaskModal: isOpen이 false라서 렌더링하지 않음');
    return null;
  }
  
  logger.debug('EditTaskModal: 렌더링 중, task:', task.title);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      updatedAt: new Date().toISOString()
    });
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    // 현재 task 값들로 form 필드 초기화
    setTitle(task.title);
    setDescription(task.description || '');
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditMode ? (
          // 수정 모드
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Edit size={24} className="mr-2 text-blue-600" />
                업무 수정
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
              
          <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={4}
                  placeholder="업무에 대한 상세 설명을 입력하세요"
            />
          </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">시작 시간</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">종료 시간</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
                  <Save size={18} />
                  <span>저장</span>
            </button>
          </div>
        </form>
      </div>
        ) : (
          // 상세보기 모드
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <AlertCircle size={24} className="mr-2 text-blue-600" />
                업무 상세정보
              </h2>
              <div className="flex items-center space-x-2">
                {hasPermission('tasks.update') && (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>수정</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
    </div>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{task.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium">상태:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusDisplayName(task.status)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-slate-500 font-medium">우선순위:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-slate-500 font-medium">마감일:</span>
                    <span className="ml-2 text-slate-800">{format(parseISO(task.dueDate), 'yyyy년 MM월 dd일')}</span>
                  </div>
                  
                  <div>
                    <span className="text-slate-500 font-medium">카테고리:</span>
                    <span className="ml-2 text-slate-800">{task.category}</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-slate-500 font-medium">담당자:</span>
                    <span className="ml-2 text-slate-800">
                      {Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : task.assignedToName}
                    </span>
                  </div>
                </div>
              </div>

              {/* 시간 정보 */}
              {(task.startTime || task.endTime) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                    <Clock size={18} className="mr-2 text-blue-600" />
                    시간 정보
                  </h4>
                  <div className="flex items-center space-x-4 text-sm">
                    {task.startTime && (
                      <div>
                        <span className="text-slate-500 font-medium">시작:</span>
                        <span className="ml-2 text-slate-800">{task.startTime}</span>
                      </div>
                    )}
                    {task.endTime && (
                      <div>
                        <span className="text-slate-500 font-medium">종료:</span>
                        <span className="ml-2 text-slate-800">{task.endTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 설명 */}
              {task.description && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-slate-800 mb-3">상세 설명</h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {/* 생성/수정 정보 */}
              <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">생성일:</span>
                    <span className="ml-2">{format(parseISO(task.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                  <div>
                    <span className="font-medium">수정일:</span>
                    <span className="ml-2">{format(parseISO(task.updatedAt), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MyTasks;
