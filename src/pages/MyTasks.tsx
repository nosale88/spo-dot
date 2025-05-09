import {
  Bell,
  Megaphone,
  CalendarDays,
  PlusSquare,
  Edit3,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTask, Task, TaskStatus, TaskPriority } from '../contexts/TaskContext';
import AddTaskModal from '../components/tasks/AddTaskModal';
import { format, parseISO } from 'date-fns';
import { parse as dateFnsParse } from 'date-fns/parse'; 
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { ko, Locale } from 'date-fns/locale';
import { startOfWeek, getDay } from 'date-fns'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css'; // Import custom calendar styles

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
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MyTaskView>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<string | undefined>(undefined); // For storing date from calendar click

  const [currentHandover, setCurrentHandover] = useState('');
  const [previousHandovers, setPreviousHandovers] = useState([
    {
      id: 'ph1',
      content: '거래처 A사 계약서 검토 완료, 법무팀 전달 필요',
      date: '2023-06-19',
      author: '홍길동',
    },
    {
      id: 'ph2',
      content: '신규 프로젝트 기획안 초안 작성 중, 50% 완료',
      date: '2023-06-19',
      author: '홍길동',
    },
  ]);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일`;
  
  const calendarEvents = useMemo(() => contextTasks.map(task => ({
    id: task.id,
    title: task.title,
    start: parseISO(task.dueDate),
    end: parseISO(task.dueDate),
    allDay: true,
    originalTask: task,
  })), [contextTasks]);

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const taskToUpdate = contextTasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      updateTask(taskId, { ...taskToUpdate, status: newStatus, updatedAt: new Date().toISOString() });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
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
        <h1 className="text-3xl font-bold text-slate-800">내 업무</h1>
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
            <button 
              onClick={() => {
                setSelectedDateForNewTask(undefined); // Clear any previously selected date for general add
                setIsAddTaskModalOpen(true);
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusSquare size={18} />
              <span>업무 추가</span>
            </button>
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
                {contextTasks.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-500">표시할 업무가 없습니다.</td></tr>
                ) : (
                  contextTasks.map((task) => (
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
                      <td className="py-3 pr-3 text-sm text-slate-700">{task.assignedToName}</td>
                      <td className="py-3 pr-3">
                        <select 
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-sm p-1.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                        <div className="flex justify-center space-x-2">
                          <button className="text-slate-500 hover:text-blue-600 transition-colors" title="수정">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleTaskDelete(task.id)} className="text-slate-500 hover:text-red-600 transition-colors" title="삭제">
                            <Trash2 size={18} />
                          </button>
                        </div>
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">금일 인계사항 작성</h2>
          <textarea
            value={currentHandover}
            onChange={(e) => setCurrentHandover(e.target.value)}
            rows={5}
            placeholder="오늘 처리해야 할 인계사항을 입력하세요..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <div className="mt-4 flex justify-end">
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">
              저장
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">전일 인계사항</h2>
          {previousHandovers.length > 0 ? (
            <ul className="space-y-3">
              {previousHandovers.map((item) => (
                <li key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-800">{item.content}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.author ? `${item.author} - ` : ''}{item.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">전일 인계사항이 없습니다.</p>
          )}
        </div>
      </section>

      {isAddTaskModalOpen && (
        <AddTaskModal 
          isOpen={isAddTaskModalOpen} 
          onClose={() => setIsAddTaskModalOpen(false)}
          initialDueDate={selectedDateForNewTask} // Pass selected date to modal
        />
      )}

      {/* TODO: 업무 수정 모달 구현 */}
    </div>
  );
};

export default MyTasks;
