import {
  Bell,
  Megaphone,
  CalendarDays,
  PlusSquare,
} from 'lucide-react';
import { useState } from 'react';
import AddReportForm from '../components/forms/AddReportForm';

const DailyReport = () => {
  const [reportTitle, setReportTitle] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [inProgressTasks, setInProgressTasks] = useState('');
  const [plannedTasks, setPlannedTasks] = useState('');
  const [issuesSuggestions, setIssuesSuggestions] = useState('');

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;
  const defaultDateValue = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(defaultDateValue);
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);

  const handleSubmit = () => {
    // 실제 제출 로직 (API 호출 등)
    console.log({
      title: reportTitle,
      completed: completedTasks,
      inProgress: inProgressTasks,
      planned: plannedTasks,
      issues: issuesSuggestions,
      reportDate: defaultDateValue // 또는 선택된 날짜
    });
    alert('보고서가 제출되었습니다.');
  };

  const handleSaveDraft = () => {
    // 임시 저장 로직
    console.log('임시 저장:', {
      title: reportTitle,
      completed: completedTasks,
      inProgress: inProgressTasks,
      planned: plannedTasks,
      issues: issuesSuggestions,
      reportDate: defaultDateValue
    });
    alert('보고서가 임시 저장되었습니다.');
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        {/* 페이지 제목은 이미지에 없지만 일관성을 위해 좌측에 표시 */}
        <h1 className="text-3xl font-bold text-slate-800">일일 업무 보고</h1> 
        <div className="flex items-center space-x-4">
          <button aria-label="Notifications" className="relative">
            <Bell className="text-slate-600 hover:text-slate-800 transition-colors" size={24} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <span className="text-sm text-slate-600">{formattedDate}</span>
        </div>
      </header>

      {/* Notice Banner */}
      <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center space-x-3 mb-6 shadow-md">
        <Megaphone size={24} className="flex-shrink-0" />
        <p className="text-sm font-medium">공지사항: 이번 주 금요일 오후 3시에 전체 회의가 있습니다. 모든 직원은 참석해주세요.</p>
      </div>

      {/* Daily Report Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-3 sm:mb-0">일일 업무 보고</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input 
                type="date" 
                defaultValue={defaultDateValue} 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
              />
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <button 
              onClick={() => setIsAddReportModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusSquare size={18} />
              <span>새 보고서</span>
            </button>
          </div>
        </div>

        {/* Report Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="mb-6">
            <label htmlFor="reportTitle" className="block mb-1.5 text-sm font-medium text-slate-700">제목</label>
            <input 
              type="text" 
              id="reportTitle" 
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="업무 보고 제목을 입력하세요"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="completedTasks" className="block mb-1.5 text-sm font-medium text-slate-700">오늘 완료한 업무</label>
            <textarea 
              id="completedTasks" 
              rows={5} 
              value={completedTasks}
              onChange={(e) => setCompletedTasks(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="오늘 완료한 업무를 상세히 작성하세요..."
            />
          </div>

          <div className="mb-6">
            <label htmlFor="inProgressTasks" className="block mb-1.5 text-sm font-medium text-slate-700">진행 중인 업무</label>
            <textarea 
              id="inProgressTasks" 
              rows={5} 
              value={inProgressTasks}
              onChange={(e) => setInProgressTasks(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="현재 진행 중인 업무와 진행 상황을 작성하세요..."
            />
          </div>

          <div className="mb-6">
            <label htmlFor="plannedTasks" className="block mb-1.5 text-sm font-medium text-slate-700">내일 예정된 업무</label>
            <textarea 
              id="plannedTasks" 
              rows={5} 
              value={plannedTasks}
              onChange={(e) => setPlannedTasks(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="내일 예정된 업무 계획을 작성하세요..."
            />
          </div>

          <div className="mb-8">
            <label htmlFor="issuesSuggestions" className="block mb-1.5 text-sm font-medium text-slate-700">특이사항 및 건의사항</label>
            <textarea 
              id="issuesSuggestions" 
              rows={5} 
              value={issuesSuggestions}
              onChange={(e) => setIssuesSuggestions(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="업무 중 특이사항이나 건의사항이 있으면 작성하세요..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              임시저장
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              제출하기
            </button>
          </div>
        </form>
      </section>

      {/* Add Report Modal */}
      {isAddReportModalOpen && (
        <AddReportForm 
          onClose={() => setIsAddReportModalOpen(false)} 
          defaultType="daily"
          initialDate={selectedDate} 
        />
      )}
    </div>
  );
};

export default DailyReport;
