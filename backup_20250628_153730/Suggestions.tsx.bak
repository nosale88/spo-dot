import {
  Bell,
  Megaphone,
  PlusSquare,
  Eye,
} from 'lucide-react';
import { useState } from 'react';

interface SuggestionItem {
  id: string;
  title: string;
  date: string;
  status: '검토중' | '답변완료' | '처리중'; // 이미지에 따른 상태
}

const initialSuggestions: SuggestionItem[] = [
  {
    id: 'sug1',
    title: '회의실 예약 시스템 개선 요청',
    date: '2023-06-15',
    status: '검토중',
  },
  {
    id: 'sug2',
    title: '휴게실 시설 개선 제안',
    date: '2023-06-10',
    status: '답변완료',
  },
];

const getStatusBadgeClass = (status: SuggestionItem['status']) => {
  switch (status) {
    case '검토중':
      return 'bg-yellow-100 text-yellow-800';
    case '답변완료':
      return 'bg-green-100 text-green-800';
    case '처리중': // 이미지에는 없지만 추가해볼 수 있는 상태
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(initialSuggestions);
  const [newSuggestionTitle, setNewSuggestionTitle] = useState('');
  const [newSuggestionContent, setNewSuggestionContent] = useState('');
  const [newSuggestionVisibility, setNewSuggestionVisibility] = useState('admin'); // 'public' or 'admin'

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;

  const handleNewSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 새 건의사항 추가 로직 (실제로는 API 호출)
    const newSuggestion: SuggestionItem = {
      id: `sug${suggestions.length + 1}`,
      title: newSuggestionTitle,
      date: new Date().toISOString().split('T')[0],
      status: '검토중',
    };
    setSuggestions([newSuggestion, ...suggestions]);
    setNewSuggestionTitle('');
    setNewSuggestionContent('');
    setNewSuggestionVisibility('admin');
    alert('새 건의사항이 제출되었습니다.');
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">건의사항</h1>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Suggestion List */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-3 sm:mb-0">건의사항 목록</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors">
              <PlusSquare size={18} />
              <span>새 건의사항</span>
            </button>
          </div>

          {/* Suggestions Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[60%]">제목</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">작성일</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-3 font-medium text-slate-800">{item.title}</td>
                    <td className="py-3 pr-3 text-sm text-slate-700">{item.date}</td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button className="text-slate-500 hover:text-blue-600 transition-colors" title="보기">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">등록된 건의사항이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: New Suggestion Form */}
        <section className="bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-xl font-semibold text-slate-700 mb-6">새 건의사항 작성</h2>
          <form onSubmit={handleNewSuggestionSubmit}>
            <div className="mb-4">
              <label htmlFor="suggestionTitle" className="block mb-1.5 text-sm font-medium text-slate-700">제목</label>
              <input 
                type="text" 
                id="suggestionTitle" 
                value={newSuggestionTitle}
                onChange={(e) => setNewSuggestionTitle(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                placeholder="건의사항 제목을 입력하세요"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="suggestionContent" className="block mb-1.5 text-sm font-medium text-slate-700">내용</label>
              <textarea 
                id="suggestionContent" 
                rows={6} 
                value={newSuggestionContent}
                onChange={(e) => setNewSuggestionContent(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                placeholder="건의사항 내용을 상세히 작성하세요..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-1.5 text-sm font-medium text-slate-700">공개 여부</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="public" 
                    checked={newSuggestionVisibility === 'public'}
                    onChange={(e) => setNewSuggestionVisibility(e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">전체 공개</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="admin" 
                    checked={newSuggestionVisibility === 'admin'}
                    onChange={(e) => setNewSuggestionVisibility(e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">관리자만</span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              제출하기
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Suggestions;
