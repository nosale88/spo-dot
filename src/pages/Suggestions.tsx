import {
  Bell,
  Megaphone,
  PlusSquare,
  Eye,
  User,
  Users,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

interface SuggestionItem {
  id: string;
  title: string;
  date: string;
  status: '검토중' | '답변완료' | '처리중';
  type: 'staff' | 'customer'; // 직원 건의사항 vs 고객 건의사항
  author: string;
  authorType: 'staff' | 'customer';
}

const initialSuggestions: SuggestionItem[] = [
  {
    id: 'sug1',
    title: '회의실 예약 시스템 개선 요청',
    date: '2023-06-15',
    status: '검토중',
    type: 'staff',
    author: '김직원',
    authorType: 'staff'
  },
  {
    id: 'sug2',
    title: '휴게실 시설 개선 제안',
    date: '2023-06-10',
    status: '답변완료',
    type: 'staff',
    author: '이매니저',
    authorType: 'staff'
  },
  {
    id: 'sug3',
    title: '운동기구 추가 요청',
    date: '2023-06-12',
    status: '검토중',
    type: 'customer',
    author: '박회원',
    authorType: 'customer'
  },
  {
    id: 'sug4',
    title: '샤워실 온수 문제',
    date: '2023-06-08',
    status: '처리중',
    type: 'customer',
    author: '최고객',
    authorType: 'customer'
  },
];

const getStatusBadgeClass = (status: SuggestionItem['status']) => {
  switch (status) {
    case '검토중':
      return 'bg-yellow-100 text-yellow-800';
    case '답변완료':
      return 'bg-green-100 text-green-800';
    case '처리중':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(initialSuggestions);
  const [newSuggestionTitle, setNewSuggestionTitle] = useState('');
  const [newSuggestionContent, setNewSuggestionContent] = useState('');
  const [newSuggestionType, setNewSuggestionType] = useState<'staff' | 'customer'>('staff');
  const [activeTab, setActiveTab] = useState<'staff' | 'customer'>('staff');

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;

  // 탭에 따라 필터링된 건의사항
  const filteredSuggestions = suggestions.filter(suggestion => suggestion.type === activeTab);
  
  // 통계 계산
  const staffSuggestions = suggestions.filter(s => s.type === 'staff');
  const customerSuggestions = suggestions.filter(s => s.type === 'customer');

  const handleNewSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSuggestion: SuggestionItem = {
      id: `sug${suggestions.length + 1}`,
      title: newSuggestionTitle,
      date: new Date().toISOString().split('T')[0],
      status: '검토중',
      type: newSuggestionType,
      author: newSuggestionType === 'staff' ? '현재사용자' : '고객명',
      authorType: newSuggestionType
    };
    setSuggestions([newSuggestion, ...suggestions]);
    setNewSuggestionTitle('');
    setNewSuggestionContent('');
    alert(`새 ${newSuggestionType === 'staff' ? '직원' : '고객'} 건의사항이 제출되었습니다.`);
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">건의사항 관리</h1>
          <p className="text-slate-600 mt-1">직원 및 고객 건의사항을 체계적으로 관리합니다</p>
        </div>
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

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 건의사항</p>
              <p className="text-2xl font-bold text-gray-900">{suggestions.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">직원 건의사항</p>
              <p className="text-2xl font-bold text-blue-600">{staffSuggestions.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">고객 건의사항</p>
              <p className="text-2xl font-bold text-green-600">{customerSuggestions.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">검토중</p>
              <p className="text-2xl font-bold text-yellow-600">
                {suggestions.filter(s => s.status === '검토중').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Suggestion List */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          {/* 탭 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'staff'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserCheck size={16} />
                직원 건의사항 ({staffSuggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'customer'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User size={16} />
                고객 건의사항 ({customerSuggestions.length})
              </button>
            </div>
          </div>

          {/* Suggestions Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[50%]">제목</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">작성자</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">작성일</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuggestions.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-3 font-medium text-slate-800">{item.title}</td>
                    <td className="py-3 pr-3 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        {item.authorType === 'staff' ? (
                          <UserCheck size={14} className="text-blue-500" />
                        ) : (
                          <User size={14} className="text-green-500" />
                        )}
                        {item.author}
                      </div>
                    </td>
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
                {filteredSuggestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                      {activeTab === 'staff' ? '등록된 직원 건의사항이 없습니다.' : '등록된 고객 건의사항이 없습니다.'}
                    </td>
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
              <label className="block mb-2 text-sm font-medium text-slate-700">건의사항 유형</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="suggestionType" 
                    value="staff" 
                    checked={newSuggestionType === 'staff'}
                    onChange={(e) => setNewSuggestionType(e.target.value as 'staff' | 'customer')}
                    className="form-radio h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <UserCheck size={16} className="text-blue-500" />
                  <span className="text-sm text-slate-700">직원 건의사항</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="suggestionType" 
                    value="customer" 
                    checked={newSuggestionType === 'customer'}
                    onChange={(e) => setNewSuggestionType(e.target.value as 'staff' | 'customer')}
                    className="form-radio h-4 w-4 text-green-600 border-slate-300 focus:ring-green-500"
                  />
                  <User size={16} className="text-green-500" />
                  <span className="text-sm text-slate-700">고객 건의사항</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="suggestionTitle" className="block mb-1.5 text-sm font-medium text-slate-700">제목</label>
              <input 
                type="text" 
                id="suggestionTitle" 
                value={newSuggestionTitle}
                onChange={(e) => setNewSuggestionTitle(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                placeholder={`${newSuggestionType === 'staff' ? '직원' : '고객'} 건의사항 제목을 입력하세요`}
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

            <button 
              type="submit"
              className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                newSuggestionType === 'staff' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {newSuggestionType === 'staff' ? (
                <UserCheck size={16} />
              ) : (
                <User size={16} />
              )}
              {newSuggestionType === 'staff' ? '직원' : '고객'} 건의사항 제출
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Suggestions;
