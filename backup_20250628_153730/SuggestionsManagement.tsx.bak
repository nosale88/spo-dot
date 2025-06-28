import React, { useState, useEffect } from 'react';
import { useSuggestion, Suggestion, SuggestionStatus } from '../../contexts/SuggestionContext';
import { format, parseISO } from 'date-fns';
import { Eye, MessageSquare, X } from 'lucide-react';

// 임시 관리자 사용자 정보 (실제로는 AuthContext 등에서 가져와야 함)
const tempAdminUser = { id: 'admin007', name: '관리자 B' };

const getStatusDisplayName = (status: SuggestionStatus) => {
  switch (status) {
    case 'pending': return '답변 대기중';
    case 'answered': return '답변 완료';
    case 'rejected': return '반려됨';
    default: return status;
  }
};

const getStatusBadgeClass = (status: SuggestionStatus) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'answered': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const AdminSuggestionsManagement: React.FC = () => {
  const { suggestions, updateSuggestionReply } = useSuggestion();
  // const { user: currentUser } = useAuth(); // 실제 사용자 정보
  const currentUser = tempAdminUser; // 임시 사용자 정보 사용

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleOpenReplyModal = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setReplyContent(suggestion.reply || '');
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedSuggestion(null);
    setReplyContent('');
  };

  const handleSaveReply = () => {
    if (selectedSuggestion && currentUser) {
      if (!replyContent.trim()) {
        alert('답변 내용을 입력해주세요.'); // 또는 sonner 같은 toast 사용
        return;
      }
      updateSuggestionReply(selectedSuggestion.id, replyContent, currentUser);
      handleCloseReplyModal();
    } else {
      alert('선택된 건의사항이 없거나 사용자 정보가 없습니다.');
    }
  };

  // 모달 외부 클릭 시 닫기 (선택적 기능)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isReplyModalOpen && event.target instanceof HTMLElement && event.target.id === 'reply-modal-overlay') {
        handleCloseReplyModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isReplyModalOpen]);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">건의사항 관리 (관리자)</h1>
      </header>
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">접수된 건의사항 목록</h2>
        
        {suggestions.length === 0 ? (
          <p className="text-slate-500">접수된 건의사항이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[30%]">제목</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[15%]">작성자</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider w-[15%]">작성일</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider w-[15%]">상태</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider w-[25%]">작업</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((suggestion: Suggestion) => ( 
                  <tr key={suggestion.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-800 truncate" title={suggestion.title}>{suggestion.title}</p>
                      <p className="text-xs text-slate-500 truncate w-80" title={suggestion.content}>{suggestion.content}</p>
                    </td>
                    <td className="py-3 pr-3 text-sm text-slate-700">{suggestion.createdByName || (suggestion.createdBy && suggestion.createdBy.name) || '익명'}</td>
                    <td className="py-3 pr-3 text-sm text-slate-700">
                      {suggestion.createdAt ? format(parseISO(suggestion.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(suggestion.status)}`}>
                        {getStatusDisplayName(suggestion.status)}
                      </span>
                    </td>
                    <td className="py-3 text-center space-x-2">
                      <button 
                        onClick={() => handleOpenReplyModal(suggestion)} 
                        className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center text-sm" 
                        title={suggestion.status === 'answered' ? "답변 보기/수정" : "답변하기"}
                      >
                        {suggestion.status === 'answered' ? <Eye size={18} className="mr-1"/> : <MessageSquare size={18} className="mr-1"/>}
                        {suggestion.status === 'answered' ? '답변 보기' : '답변하기'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reply Modal */}
      {isReplyModalOpen && selectedSuggestion && (
        <div 
          id="reply-modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
            <button 
              onClick={handleCloseReplyModal} 
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-semibold text-slate-800 mb-4">
              {selectedSuggestion.status === 'answered' ? '답변 보기/수정' : '답변 작성'}
            </h3>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-1">건의 제목:</h4>
              <p className="text-slate-800 text-lg">{selectedSuggestion.title}</p>
              <h4 className="text-sm font-semibold text-slate-600 mt-2 mb-1">건의 내용:</h4>
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{selectedSuggestion.content}</p>
              <div className="text-xs text-slate-500 mt-2">
                <span>작성자: {selectedSuggestion.createdByName || (selectedSuggestion.createdBy && selectedSuggestion.createdBy.name) || '익명'}</span>
                <span className="mx-1">|</span>
                <span>작성일: {selectedSuggestion.createdAt ? format(parseISO(selectedSuggestion.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}</span>
              </div>
            </div>

            <div>
              <label htmlFor="replyContent" className="block text-sm font-medium text-slate-700 mb-1">
                답변 내용
              </label>
              <textarea
                id="replyContent"
                name="replyContent"
                rows={6}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400 transition-colors"
                placeholder="건의사항에 대한 답변을 입력하세요..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseReplyModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveReply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                답변 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuggestionsManagement;
