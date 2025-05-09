import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle, UserCheck, Clock, Users, BarChart2, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardCard from '../components/dashboard/DashboardCard';
import SchedulePreview from '../components/dashboard/SchedulePreview';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';
import TasksPreview from '../components/dashboard/TasksPreview';
import PerformanceChart from '../components/dashboard/PerformanceChart';

// 대시보드 데이터 타입 (실제로는 API로부터 가져와야 함)
interface DashboardData {
  todaySessions: number;
  attendanceRate: number;
  activeClients: number;
  completedTasks: number;
  pendingTasks: number;
}

// 파라미터 증가 애니메이션을 위한 훅
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return count;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todaySessions: 12,
    attendanceRate: 85,
    activeClients: 124,
    completedTasks: 18,
    pendingTasks: 7,
  });

  // 카운트업 애니메이션 적용
  const animatedSessions = useCountUp(dashboardData.todaySessions);
  const animatedAttendance = useCountUp(dashboardData.attendanceRate);
  const animatedClients = useCountUp(dashboardData.activeClients);
  const animatedCompletedTasks = useCountUp(dashboardData.completedTasks);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          안녕하세요, {user?.name}님!
        </h1>
        <div className="mt-2 sm:mt-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            오늘은 {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              weekday: 'long' 
            })}입니다
          </p>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="오늘의 세션"
          value={animatedSessions}
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
          description="예정된 PT 세션"
          trend="up"
          trendValue="8%"
        />
        
        <DashboardCard 
          title="출석률"
          value={`${animatedAttendance}%`}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          description="지난 주 대비"
          trend="up"
          trendValue="3%"
        />
        
        <DashboardCard 
          title="활성 고객"
          value={animatedClients}
          icon={<Users className="h-6 w-6 text-indigo-500" />}
          description="이번 달 활성 사용자"
          trend="up"
          trendValue="5%"
        />
        
        <DashboardCard 
          title="완료된 업무"
          value={animatedCompletedTasks}
          icon={<CheckCircle className="h-6 w-6 text-purple-500" />}
          description={`대기 중: ${dashboardData.pendingTasks}`}
          trend="up"
          trendValue="12%"
        />
      </div>

      {/* 대시보드 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 컨텐츠: 일정 및 업무 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 오늘의 일정 */}
          <div className="card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  오늘의 일정
                </h2>
                <button className="text-sm text-primary hover:text-primary-dark transition-colors">
                  전체 보기
                </button>
              </div>
              <SchedulePreview />
            </div>
          </div>

          {/* 업무 현황 */}
          <div className="card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  업무 현황
                </h2>
                <button className="text-sm text-primary hover:text-primary-dark transition-colors">
                  전체 보기
                </button>
              </div>
              <TasksPreview />
            </div>
          </div>

          {/* 성과 지표 */}
          <div className="card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  성과 지표
                </h2>
                <div className="flex space-x-2">
                  <button className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    주간
                  </button>
                  <button className="text-xs px-2 py-1 rounded bg-primary text-white">
                    월간
                  </button>
                  <button className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    연간
                  </button>
                </div>
              </div>
              <PerformanceChart />
            </div>
          </div>
        </div>

        {/* 우측 컨텐츠: 알림 및 퀵 액세스 */}
        <div className="space-y-6">
          {/* 알림 패널 */}
          <div className="card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  최근 알림
                </h2>
                <button className="text-sm text-primary hover:text-primary-dark transition-colors">
                  모두 보기
                </button>
              </div>
              <NotificationsPanel />
            </div>
          </div>

          {/* 퀵 액세스 */}
          <div className="card">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                빠른 액세스
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex flex-col items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-slate-900 dark:text-white">고객 등록</span>
                </button>
                <button className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-slate-900 dark:text-white">세션 추가</span>
                </button>
                <button className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex flex-col items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-slate-900 dark:text-white">출석 체크</span>
                </button>
                <button className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex flex-col items-center justify-center">
                  <BarChart2 className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-slate-900 dark:text-white">보고서</span>
                </button>
              </div>
            </div>
          </div>

          {/* 트레이너 상태 */}
          <div className="card">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                트레이너 상태
              </h2>
              <div className="space-y-3">
                {[
                  { name: '김철수', status: 'online', time: '세션 중 (30분 남음)' },
                  { name: '박영희', status: 'online', time: '대기 중' },
                  { name: '이지수', status: 'offline', time: '오늘 휴무' },
                  { name: '정민호', status: 'away', time: '점심 시간 (15분 남음)' }
                ].map((trainer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        trainer.status === 'online' ? 'bg-green-500' : 
                        trainer.status === 'away' ? 'bg-yellow-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {trainer.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {trainer.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;