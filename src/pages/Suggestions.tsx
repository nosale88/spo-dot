import {
  Bell,
  Megaphone,
  PlusSquare,
  Eye,
  X,
  Calendar,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  status: '검토중' | '답변완료' | '처리중';
  visibility: 'public' | 'admin';
}

const initialSuggestions: SuggestionItem[] = [
  {
    id: 'sug1',
    title: '회의실 예약 시스템 개선 요청',
    content: '현재 회의실 예약 시스템이 불편해서 개선이 필요합니다. 모바일에서도 쉽게 예약할 수 있도록 해주세요.',
    date: '2023-06-15',
    author: '김직원',
    status: '검토중',
    visibility: 'admin',
  },
  {
    id: 'sug2',
    title: '휴게실 시설 개선 제안',
    content: '휴게실에 냉장고와 전자레인지를 추가해주시면 직원들이 점심시간을 더 편리하게 보낼 수 있을 것 같습니다.',
    date: '2023-06-10',
    author: '이팀장',
    status: '답변완료',
    visibility: 'public',
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
  const { showToast } = useNotification();
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(initialSuggestions);
  const [newSuggestionTitle, setNewSuggestionTitle] = useState('');
  const [newSuggestionContent, setNewSuggestionContent] = useState('');
  const [newSuggestionVisibility, setNewSuggestionVisibility] = useState('admin');
  
  // 모달 상태
  const [showNewSuggestionModal, setShowNewSuggestionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;

  const handleNewSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSuggestionTitle.trim() || !newSuggestionContent.trim()) {
      showToast('error', '입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    const newSuggestion: SuggestionItem = {
      id: `sug${Date.now()}`,
      title: newSuggestionTitle,
      content: newSuggestionContent,
      date: new Date().toISOString().split('T')[0],
      author: '현재 사용자', // 실제로는 로그인한 사용자 정보를 사용
      status: '검토중',
      visibility: newSuggestionVisibility as 'public' | 'admin',
    };
    
    setSuggestions([newSuggestion, ...suggestions]);
    setNewSuggestionTitle('');
    setNewSuggestionContent('');
    setNewSuggestionVisibility('admin');
    setShowNewSuggestionModal(false);
    showToast('success', '건의사항 제출 완료', '새 건의사항이 성공적으로 제출되었습니다.');
  };

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    setSelectedSuggestion(suggestion);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
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

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-3 sm:mb-0">건의사항 목록</h2>
          <button 
            onClick={() => setShowNewSuggestionModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
              <PlusSquare size={18} />
              <span>새 건의사항</span>
            </button>
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
                {suggestions.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-3">
                    <button
                      onClick={() => handleSuggestionClick(item)}
                      className="font-medium text-slate-800 hover:text-blue-600 transition-colors text-left"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="py-3 pr-3 text-sm text-slate-700">{item.author}</td>
                    <td className="py-3 pr-3 text-sm text-slate-700">{item.date}</td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                    <button 
                      onClick={() => handleSuggestionClick(item)}
                      className="text-slate-500 hover:text-blue-600 transition-colors" 
                      title="보기"
                    >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">등록된 건의사항이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* 새 건의사항 모달 */}
      <AnimatePresence>
        {showNewSuggestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewSuggestionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">새 건의사항 작성</h2>
                <button
                  onClick={() => setShowNewSuggestionModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
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

                  <div className="flex space-x-3">
                    <button 
                      type="button"
                      onClick={() => setShowNewSuggestionModal(false)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition-colors"
                    >
                      취소
                    </button>
            <button 
              type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              제출하기
            </button>
                  </div>
          </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상세 보기 모달 */}
      <AnimatePresence>
        {showDetailModal && selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">건의사항 상세</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{selectedSuggestion.title}</h3>
                  
                  <div className="flex items-center space-x-6 mb-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>{selectedSuggestion.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{formatDate(selectedSuggestion.date)}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedSuggestion.status)}`}>
                      {selectedSuggestion.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">건의 내용</h4>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedSuggestion.content}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">공개 범위</h4>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedSuggestion.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedSuggestion.visibility === 'public' ? '전체 공개' : '관리자만'}
                  </span>
                </div>

                {selectedSuggestion.status === '답변완료' && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">관리자 답변</h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-slate-700 leading-relaxed">
                        건의해주신 내용을 검토한 결과, 다음 분기에 해당 시설 개선 작업을 진행할 예정입니다. 
                        자세한 일정은 추후 공지사항을 통해 안내드리겠습니다. 소중한 의견 감사합니다.
                      </p>
                      <div className="mt-3 text-sm text-slate-500">
                        답변일: 2023-06-16 | 답변자: 관리자
                      </div>
                    </div>
                  </div>
                )}
      </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Suggestions;
