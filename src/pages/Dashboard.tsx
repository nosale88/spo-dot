import {
  Bell,
  Megaphone,
  Briefcase, // 총 업무
  Loader2, // 진행 중 (Zap 대신 사용)
  CheckCircle2, // 완료
  AlertTriangle, // 중요 업무
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  team: string;
  status: '진행중' | '완료';
  dueDate: string;
  priority: '높음' | '중간' | '낮음';
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  contentSnippet: string;
}

const summaryStats = [
  { title: '총 업무', value: 12, icon: <Briefcase size={28} className="text-blue-500" />, bgColor: 'bg-blue-100' },
  { title: '진행 중', value: 5, icon: <Loader2 size={28} className="text-yellow-500" />, bgColor: 'bg-yellow-100' },
  { title: '완료', value: 7, icon: <CheckCircle2 size={28} className="text-green-500" />, bgColor: 'bg-green-100' },
  { title: '중요 업무', value: 3, icon: <AlertTriangle size={28} className="text-red-500" />, bgColor: 'bg-red-100' },
];

const tasks: Task[] = [
  {
    id: '1',
    title: '월간 보고서 작성',
    team: '마케팅팀',
    status: '진행중',
    dueDate: '오늘',
    priority: '높음',
  },
  {
    id: '2',
    title: '고객 미팅 준비',
    team: '영업팀',
    status: '진행중',
    dueDate: '내일',
    priority: '중간',
  },
  {
    id: '3',
    title: '이메일 회신',
    team: '관리팀',
    status: '완료',
    dueDate: '오늘',
    priority: '낮음',
  },
];

const announcements: Announcement[] = [
  {
    id: '1',
    title: '전체 회의 안내',
    date: '2023-06-20',
    contentSnippet: '이번 주 금요일 오후 3시에 전체 회의가 있습니다.',
  },
  {
    id: '2',
    title: '시스템 점검 안내',
    date: '2023-06-18',
    contentSnippet: '6월 25일 오전 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
  },
  {
    id: '3',
    title: '신규 프로젝트 시작',
    date: '2023-06-15',
    contentSnippet: '7월부터 신규 프로젝트가 시작됩니다. 관련 부서는 준비 바랍니다.',
  },
];

const getPriorityClass = (priority: Task['priority']) => {
  switch (priority) {
    case '높음': return 'bg-red-500';
    case '중간': return 'bg-orange-500';
    case '낮음': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusClass = (status: Task['status']) => {
  switch (status) {
    case '진행중': return 'bg-yellow-100 text-yellow-800';
    case '완료': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Dashboard = () => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* 1. 상단 바 */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">대시보드</h1>
        <div className="flex items-center space-x-4">
          <button aria-label="Notifications" className="relative">
            <Bell className="text-slate-600 hover:text-slate-800 transition-colors" size={24} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <span className="text-sm text-slate-600">{formattedDate}</span>
        </div>
      </header>

      {/* 2. 공지사항 배너 */}
      <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center space-x-3 mb-6 shadow-md">
        <Megaphone size={24} className="flex-shrink-0" />
        <p className="text-sm font-medium">공지사항: 이번 주 금요일 오후 3시에 전체 회의가 있습니다. 모든 직원은 참석해주세요.</p>
      </div>

      {/* 3. 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryStats.map((stat) => (
          <div key={stat.title} className={`p-5 rounded-xl shadow-lg flex items-center space-x-4 ${stat.bgColor}`}>
            <div className={`p-3 rounded-full ${stat.bgColor.replace('-100', '-200')}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. 오늘의 업무 테이블 */} 
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-slate-700">오늘의 업무</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">업무</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">마감일</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">중요도</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-3">
                      <p className="font-semibold text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.team}</p>
                    </td>
                    <td className="py-4 pr-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 pr-3 text-sm text-slate-700">{task.dueDate}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-block h-3 w-3 rounded-full ${getPriorityClass(task.priority)}`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. 최근 공지사항 목록 */} 
        <section className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-slate-700">최근 공지사항</h2>
          <div className="space-y-5">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="pb-4 border-b border-slate-100 last:border-b-0">
                <h3 className="font-semibold text-slate-800 mb-1">{announcement.title}</h3>
                <p className="text-xs text-slate-500 mb-1.5">{announcement.date}</p>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{announcement.contentSnippet}</p>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors">
                  필독
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;