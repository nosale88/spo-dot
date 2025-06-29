import {
  Bell,
  Megaphone,
  CalendarDays,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTask, Task, TaskStatus, TaskPriority } from '../contexts/TaskContext';
import { parse as dateFnsParse } from 'date-fns/parse'; 
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { ko, Locale } from 'date-fns/locale';
import { getDay } from 'date-fns'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import TaskDetails from '../components/tasks/TaskDetails';

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

const getStatusBadgeClass = (status: TaskStatus | undefined) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

type AllTaskView = 'list' | 'month' | 'week' | 'day';

const AllTasks = () => {
  const { tasks: contextTasks } = useTask();
  const { staff: staffList, loadingStaff } = useUser();
  const [currentView, setCurrentView] = useState<AllTaskView>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;

  // 업무 클릭 핸들러 추가
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setIsTaskDetailsOpen(false);
    setSelectedTask(null);
  };

  const staffOptions = useMemo(() => {
    const uniqueStaff = Array.from(new Set(contextTasks.map(task => 
      Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : (task.assignedToName || 'N/A')
    )));
    return ['전체', ...uniqueStaff];
  }, [contextTasks]);

  const filteredTasks = useMemo(() => {
    if (selectedAssignee === '전체') {
      return contextTasks;
    }
    return contextTasks.filter(task => {
      const assigneeName = Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : (task.assignedToName || 'N/A');
      return assigneeName === selectedAssignee;
    });
  }, [contextTasks, selectedAssignee]);

  const calendarEvents: CalendarEvent[] = useMemo(() => filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    start: parseISO(task.dueDate),
    end: parseISO(task.dueDate),
    allDay: true,
    originalTask: task,
  })), [filteredTasks]);

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">전체 업무</h1>
              <p className="text-slate-600">모든 업무를 확인하고 관리하세요</p>
            </div>
            
            {/* 날짜 및 알림 */}
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm">{formattedDate}</span>
              <button aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="text-slate-600" size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
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
              {(['list', 'month', 'week', 'day'] as AllTaskView[]).map((view) => (
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
            
            {/* 필터 및 날짜 네비게이션 */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select 
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-40"
                >
                  {staffOptions.map(staff => <option key={staff} value={staff}>{staff}</option>)}
                </select>
              </div>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="date" 
                  value={format(calendarDate, 'yyyy-MM-dd')} 
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

        {/* 업무 보기 컨텐츠 */}
        {currentView === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-slate-800">담당자</th>
                  <th className="py-3 px-4 text-left font-medium text-slate-800">업무</th>
                  <th className="py-3 px-4 text-left font-medium text-slate-800">상태</th>
                  <th className="py-3 px-4 text-left font-medium text-slate-800">마감일</th>
                  <th className="py-3 px-4 text-center font-medium text-slate-800">우선순위</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-500">표시할 업무가 없습니다.</td></tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : (task.assignedToName || 'N/A')}
                      </td>
                      <td className="py-3 px-4">
                        <p 
                          className="font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleTaskClick(task)}
                        >
                          {task.title}
                        </p>
                        {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                          {getStatusDisplayName(task.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{format(parseISO(task.dueDate), 'yyyy-MM-dd')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block h-3 w-3 rounded-full ${getPriorityClass(task.priority)}`}></span>
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
                  {/* 날짜 */}
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
                          담당자: {Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : (task.assignedToName || 'N/A')}
                        </div>
                      </div>
                    ))}
                    
                    {day.tasks.length === 0 && (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                        <span className="text-slate-400 text-sm">업무 없음</span>
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
                  <p className="text-slate-500">이 날짜에 예정된 업무가 없습니다.</p>
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
                        <span>담당자: {Array.isArray(task.assignedToName) ? task.assignedToName.join(', ') : (task.assignedToName || 'N/A')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ height: '700px' }} className="mb-6">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              view={currentView as Exclude<AllTaskView, 'list'>}
              views={['month', 'week', 'day']}
              date={calendarDate}
              onNavigate={date => setCalendarDate(date)}
              onView={newView => setCurrentView(newView as AllTaskView)}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              messages={{
                month: '월간',
                week: '주간',
                day: '일간',
                today: '오늘',
                previous: '이전',
                next: '다음',
                agenda: '일정 목록'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTasks;
