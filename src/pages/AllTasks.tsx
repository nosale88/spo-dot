import {
  Bell,
  Megaphone,
  CalendarDays,
  ChevronDown,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTask, Task, TaskStatus, TaskPriority } from '../contexts/TaskContext';
import { format, parseISO } from 'date-fns';
import { parse as dateFnsParse } from 'date-fns/parse'; 
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { ko, Locale } from 'date-fns/locale';
import { startOfWeek, getDay } from 'date-fns'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

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

type AllTaskView = 'list' | 'month' | 'week' | 'day';

const AllTasks = () => {
  const { tasks: contextTasks } = useTask();
  const [currentView, setCurrentView] = useState<AllTaskView>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedAssignee, setSelectedAssignee] = useState<string>('모든 직원');

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;

  const staffOptions = useMemo(() => {
    const assignees = new Set<string>(['모든 직원']);
    contextTasks.forEach(task => {
      if (task.assignedToName) assignees.add(task.assignedToName);
      // 만약 assignedToName 필드가 없다면, assignedTo (ID)를 사용하고 UserContext 등에서 이름을 찾아야 함
      // else if (task.assignedTo) { /* 사용자 ID로 이름 찾는 로직 */ }
    });
    return Array.from(assignees);
  }, [contextTasks]);

  const filteredTasks = useMemo(() => {
    if (selectedAssignee === '모든 직원') {
      return contextTasks;
    }
    return contextTasks.filter(task => task.assignedToName === selectedAssignee 
      // || task.assignedTo === selectedAssigneeId_if_using_ids // assigneeId -> assignedTo
    );
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
    <div className="p-6 bg-slate-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">전체 업무 보기</h1>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-3 sm:mb-0">전체 업무 목록</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select 
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8"
              >
                {staffOptions.map(staff => <option key={staff} value={staff}>{staff}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex items-center p-1 bg-slate-200 rounded-lg">
              {(['list', 'month', 'week', 'day'] as AllTaskView[]).map((view) => (
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
                value={format(calendarDate, 'yyyy-MM-dd')} 
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
          </div>
        </div>

        {currentView === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[15%]">담당자</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[35%]">업무</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">마감일</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">중요도</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-10 text-slate-500">표시할 업무가 없습니다.</td></tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-3 font-medium text-slate-800">{task.assignedToName || task.assignedTo || 'N/A'}</td>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full`}>
                          {getStatusDisplayName(task.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-sm text-slate-700">{format(parseISO(task.dueDate), 'yyyy-MM-dd')}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block h-3 w-3 rounded-full ${getPriorityClass(task.priority)}`}></span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
      </section>
    </div>
  );
};

export default AllTasks;
