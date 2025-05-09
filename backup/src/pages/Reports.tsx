import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  Users, 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Activity
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// 차트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 보고서 기간 타입
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const Reports = () => {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  
  // 차트 공통 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: document.documentElement.classList.contains('dark') ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)',
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)',
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569',
        },
      },
    },
  };
  
  // 매출 차트 데이터
  const revenueData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: 'PT 매출',
        data: [12500000, 13200000, 15000000, 14800000, 16200000, 17500000],
        borderColor: 'rgb(45, 85, 255)',
        backgroundColor: 'rgba(45, 85, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '회원권 매출',
        data: [8300000, 8500000, 8800000, 9200000, 9500000, 9800000],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  // 회원 등록 차트 데이터
  const clientRegistrationData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: '신규 등록',
        data: [35, 42, 49, 53, 58, 62],
        backgroundColor: 'rgba(45, 85, 255, 0.8)',
      },
      {
        label: '재등록',
        data: [15, 18, 22, 19, 24, 28],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
      },
    ],
  };
  
  // 출석 분포 차트 데이터
  const attendanceDistributionData = {
    labels: ['오전 6-9시', '오전 9-12시', '오후 12-3시', '오후 3-6시', '오후 6-9시', '오후 9-12시'],
    datasets: [
      {
        label: '시간대별 출석',
        data: [18, 25, 12, 20, 30, 15],
        backgroundColor: [
          'rgba(45, 85, 255, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 매출 세부 정보 데이터
  const revenueDetailData = [
    { category: 'PT 개인 세션', amount: 9800000, percentage: 56, trend: 'up', trendValue: '8%' },
    { category: '그룹 클래스', amount: 3800000, percentage: 22, trend: 'up', trendValue: '12%' },
    { category: '회원권 판매', amount: 2800000, percentage: 16, trend: 'down', trendValue: '3%' },
    { category: '보충제 판매', amount: 1100000, percentage: 6, trend: 'up', trendValue: '5%' },
  ];
  
  // 고객 세부 정보 데이터
  const clientDetailData = [
    { category: '활성 회원', count: 320, percentage: 100, trend: 'up', trendValue: '5%' },
    { category: '정기 방문', count: 210, percentage: 66, trend: 'up', trendValue: '7%' },
    { category: '간헐적 방문', count: 80, percentage: 25, trend: 'down', trendValue: '2%' },
    { category: '최근 미방문', count: 30, percentage: 9, trend: 'down', trendValue: '10%' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">보고서</h1>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 text-sm font-medium ${
                period === 'daily'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              일간
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 text-sm font-medium ${
                period === 'weekly'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 text-sm font-medium ${
                period === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-3 py-1.5 text-sm font-medium ${
                period === 'yearly'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              연간
            </button>
          </div>
          
          <button className="btn btn-outline inline-flex items-center">
            <Filter size={16} className="mr-2" />
            필터
          </button>
          
          <button className="btn btn-primary inline-flex items-center">
            <Download size={16} className="mr-2" />
            내보내기
          </button>
        </div>
      </div>
      
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              총 매출
            </h3>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ₩17,500,000
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                2023년 6월
              </p>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
              <TrendingUp size={16} className="mr-1" />
              <span>12.5%</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              활성 회원
            </h3>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                320명
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                전월 대비
              </p>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
              <TrendingUp size={16} className="mr-1" />
              <span>5.2%</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              완료된 세션
            </h3>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                486회
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                지난 30일간
              </p>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
              <TrendingUp size={16} className="mr-1" />
              <span>8.3%</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              평균 출석률
            </h3>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                78.5%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                지난 30일간
              </p>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
              <TrendingUp size={16} className="mr-1" />
              <span>3.1%</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* 매출 차트 */}
      <div className="card">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-primary" />
              매출 보고서
            </h2>
            <button 
              onClick={() => setShowRevenueDetails(!showRevenueDetails)}
              className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center"
            >
              {showRevenueDetails ? '요약 보기' : '세부 정보'}
              {showRevenueDetails ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
          </div>
          <div className="h-80">
            <Line options={chartOptions} data={revenueData} />
          </div>
        </div>
        
        {/* 매출 세부 정보 */}
        {showRevenueDetails && (
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">매출 분류</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      금액
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      비율
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      변화
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {revenueDetailData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        ₩{item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-slate-700 dark:text-slate-300">
                            {item.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-xs ${
                          item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.trend === 'up' ? (
                            <TrendingUp size={16} className="mr-1" />
                          ) : (
                            <ChevronDown size={16} className="mr-1" />
                          )}
                          <span>{item.trendValue}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 회원 등록 차트 */}
        <div className="card">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                회원 등록 현황
              </h2>
              <button 
                onClick={() => setShowClientDetails(!showClientDetails)}
                className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center"
              >
                {showClientDetails ? '요약 보기' : '세부 정보'}
                {showClientDetails ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </button>
            </div>
            <div className="h-64">
              <Bar options={chartOptions} data={clientRegistrationData} />
            </div>
          </div>
          
          {/* 고객 세부 정보 */}
          {showClientDetails && (
            <div className="p-4 sm:p-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">회원 분류</h3>
              <div className="space-y-4">
                {clientDetailData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.category}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.count}명</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-slate-700 dark:text-slate-300">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center text-xs ml-4 ${
                      item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {item.trend === 'up' ? (
                        <TrendingUp size={16} className="mr-1" />
                      ) : (
                        <ChevronDown size={16} className="mr-1" />
                      )}
                      <span>{item.trendValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 시간대별 출석 분포 */}
        <div className="card">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                시간대별 출석 분포
              </h2>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div style={{ width: '80%' }}>
                <Doughnut 
                  data={attendanceDistributionData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'right',
                      },
                    },
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 요약 지표 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">주요 성과 지표</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">회원 만족도</h3>
            <div className="flex items-center space-x-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill={star <= 4 ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-yellow-400"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
              <span className="text-lg font-bold text-slate-900 dark:text-white ml-2">4.2</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              250개의 리뷰 기준
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">회원 유지율</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-lg font-semibold inline-block text-slate-900 dark:text-white">
                    85%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600 dark:text-green-400">
                    +2% 전월 대비
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-slate-200 dark:bg-slate-700">
                <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                업계 평균: 78%
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">평균 체류 시간</h3>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              82분
            </p>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp size={14} className="mr-1" />
              <span>5% 증가 (전월 대비)</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              회원당 평균 피트니스 센터 이용 시간
            </p>
          </div>
        </div>
      </div>
      
      {/* 보고서 다운로드 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">보고서 내보내기</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-outline flex items-center justify-center">
            <Download size={16} className="mr-2" />
            PDF 다운로드
          </button>
          <button className="btn btn-outline flex items-center justify-center">
            <Download size={16} className="mr-2" />
            EXCEL 다운로드
          </button>
          <button className="btn btn-outline flex items-center justify-center">
            <Download size={16} className="mr-2" />
            CSV 다운로드
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;