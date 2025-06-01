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
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database.types';
import AddTaskModal from '../components/tasks/AddTaskModal';
import { format, parseISO } from 'date-fns';
import { parse as dateFnsParse } from 'date-fns/parse'; 
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { ko, Locale } from 'date-fns/locale';
import { startOfWeek, getDay } from 'date-fns'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css'; // Import custom calendar styles
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

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

  const calendarComponents = useMemo(() => {
    if (currentView === 'month') {
      return {
        dateCellWrapper: CustomMonthDateCell,
      };
    }
    return undefined; // Or an empty object {}, undefined should be fine for RBC components prop
  }, [currentView, calendarEvents]); // CustomMonthDateCell implicitly depends on calendarEvents

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">내 업무</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-600">
              {user?.name || '사용자'}님
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              hasPermission('admin.dashboard') 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {hasPermission('admin.dashboard') ? '관리자' : '일반 사용자'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button aria-label="Notifications" className="relative">
            <Bell className="text-slate-600 hover:text-slate-800 transition-colors" size={24} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <span className="text-sm text-slate-600">{formattedDate}</span>
        </div>
      </header>

      <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center space-x-3 mb-6 shadow-md">
        <Megaphone size={24} className="flex-shrink-0" />
        <p className="text-sm font-medium">공지사항: 이번 주 금요일 오후 3시에 전체 회의가 있습니다. 모든 직원은 참석해주세요.</p>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700 mb-3 sm:mb-0">내 업무 목록</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center p-1 bg-slate-200 rounded-lg">
              {(['list', 'month', 'week', 'day'] as MyTaskView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors 
                              ${currentView === view 
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-300'}`}
                >
                  {view === 'list' ? '목록' : view === 'month' ? '월간' : view === 'week' ? '주간' : '일간'}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setCalendarDate(parseISO(e.target.value))} 
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
              />
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            {currentView !== 'list' && (
              <button 
                onClick={() => setCalendarDate(new Date())} 
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-slate-600 hover:bg-slate-300 border border-slate-300">
                오늘
              </button>
            )}
            {/* 업무 추가 버튼 - 권한 체크 완화 */}
            {(hasPermission('tasks.create') || !user) && (
              <button 
                onClick={() => {
                  console.log('업무추가 버튼 클릭됨');
                  console.log('현재 사용자:', user);
                  console.log('tasks.create 권한:', hasPermission('tasks.create'));
                  setSelectedDateForNewTask(undefined); // Clear any previously selected date for general add
                  setIsAddTaskModalOpen(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                <PlusSquare size={18} />
                <span>업무 추가</span>
              </button>
            )}
            
            {/* 권한이 없는 경우 안내 메시지 */}
            {user && !hasPermission('tasks.create') && (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                업무 추가 권한이 없습니다 (현재 역할: {user.role})
              </div>
            )}
          </div>
        </div>

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
                            <p className="font-semibold text-slate-800">{task.title}</p>
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
              components={calendarComponents} 
              className="rbc-calendar-main"
            />
          </div>
        )}
      </section>

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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 금일 인계사항 작성 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg"
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
          className="bg-white p-6 rounded-xl shadow-lg"
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
