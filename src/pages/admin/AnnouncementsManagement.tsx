import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAnnouncement } from '../../contexts/AnnouncementContext';
import { Announcement } from '../../types'; 
import { format, parseISO } from 'date-fns';
import { Edit3, Trash2, PlusCircle, CheckSquare, Square } from 'lucide-react';

const MOCK_USER_ID = 'admin'; // 실제 로그인 유저 id로 대체 가능

const AnnouncementsManagement: React.FC = () => {
  const {
    announcements,
    loading,
    error,
    fetchAnnouncements, 
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 검색/필터 상태
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 카테고리/태그 입력 상태
  const [categoryInput, setCategoryInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // 성능 최적화: useMemo로 필터링
  const filteredAnnouncements = useMemo(() => announcements.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q) ||
      (a.targetAudience || '').toLowerCase().includes(q) ||
      (a.isPublished ? '게시됨' : '게시 안됨').includes(q) ||
      (a.category || '').toLowerCase().includes(q) ||
      (a.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }), [announcements, search]);

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setCurrentAnnouncement({ ...announcement });
      setCategoryInput(announcement.category || '');
      setTagsInput((announcement.tags || []).join(','));
      setIsEditMode(true);
    } else {
      setCurrentAnnouncement({ title: '', content: '', targetAudience: 'all', category: '', tags: [] });
      setCategoryInput('');
      setTagsInput('');
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAnnouncement(null);
    setIsEditMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentAnnouncement) {
      const { name, value } = e.target;
      setCurrentAnnouncement({ ...currentAnnouncement, [name]: value });
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!currentAnnouncement || !currentAnnouncement.title?.trim() || !currentAnnouncement.content?.trim()) {
      alert('제목과 내용은 필수 항목입니다.'); 
      return;
    }

    try {
      const category = categoryInput.trim();
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      if (isEditMode && currentAnnouncement.id) {
        await updateAnnouncement({ ...currentAnnouncement, category, tags } as Partial<Announcement> & { id: string });
      } else {
        const newAnnouncementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> = {
          title: currentAnnouncement.title,
          content: currentAnnouncement.content,
          targetAudience: currentAnnouncement.targetAudience || 'all',
          category,
          tags,
        };
        await addAnnouncement(newAnnouncementData);
      }
      handleCloseModal();
      fetchAnnouncements(); 
    } catch (saveError) {
      console.error('Failed to save announcement:', saveError);
      alert('공지사항 저장에 실패했습니다.'); 
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await deleteAnnouncement(id);
        fetchAnnouncements(); 
      } catch (deleteError) {
        console.error('Failed to delete announcement:', deleteError);
        alert('공지사항 삭제에 실패했습니다.'); 
      }
    }
  };

  const handleSetForBanner = async (targetAnnouncement: Announcement) => {
    if (!targetAnnouncement) return;
    
    try {
      // Toggle the showInBanner status for the target announcement
      await updateAnnouncement({ 
        ...targetAnnouncement, 
        showInBanner: !targetAnnouncement.showInBanner 
      });
    } catch (e) {
      console.error("Failed to update banner status for announcement:", e);
      // Handle error (e.g., show a notification to the user)
    }
  };

  // 공지 클릭 시 읽음 처리
  const handleAnnouncementClick = (announcement: Announcement) => {
    if (!announcement.readBy?.includes(MOCK_USER_ID)) {
      updateAnnouncement({
        ...announcement,
        readBy: [...(announcement.readBy || []), MOCK_USER_ID],
      });
    }
    handleOpenModal(announcement);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModalOpen && event.target instanceof HTMLElement && event.target.id === 'announcement-modal-overlay') {
        handleCloseModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // 모달 열릴 때 제목 input에 자동 포커스
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        const el = document.getElementById('title');
        if (el) (el as HTMLInputElement).focus();
      }, 100);
    }
  }, [isModalOpen]);

  if (loading && announcements.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="ml-3 text-lg text-slate-700">공지사항을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-6 text-center">
        <h2 className="text-2xl font-semibold text-red-700 mb-2">오류 발생</h2>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={() => fetchAnnouncements()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">공지사항 관리</h1>
        <p className="text-slate-600 mt-1">이곳에서 전체 공지사항을 관리할 수 있습니다.</p>
      </header>

      {/* 검색 입력창 */}
      <div className="mb-4 flex items-center">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="제목, 내용, 대상, 상태로 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); searchInputRef.current?.focus(); }}
            className="ml-2 text-slate-400 hover:text-slate-700"
            aria-label="검색 초기화"
          >
            ×
          </button>
        )}
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <PlusCircle size={20} className="mr-2" />
          새 공지사항 추가
        </button>
      </div>

      {filteredAnnouncements.length === 0 && !loading && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">검색 결과가 없습니다.</h3>
          <p className="text-slate-500">검색어를 지우거나, 새 공지사항을 추가해보세요.</p>
          {announcements.length === 0 && <p className="text-slate-400 mt-2">아직 등록된 공지사항이 없습니다.</p>}
        </div>
      )}

      {filteredAnnouncements.length > 0 && (
        <section className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">제목</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">대상</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">상태</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">작성일</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">배너 지정</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleAnnouncementClick(announcement)}>
                      <div className="text-sm font-semibold text-slate-900 truncate max-w-xs" title={announcement.title}>
                        {announcement.title}
                        {!(announcement.readBy || []).includes(MOCK_USER_ID) && (
                          <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-red-500 text-white rounded-full align-middle">NEW</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs" title={announcement.content}>{announcement.content.substring(0, 50) + (announcement.content.length > 50 ? '...' : '')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {announcement.targetAudience === 'all' ? '전체' : announcement.targetAudience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${announcement.isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {announcement.isPublished ? '게시됨' : '게시 안됨'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {format(parseISO(announcement.createdAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleSetForBanner(announcement)}
                        className={`p-2 rounded-md transition-colors duration-150 
                                    ${announcement.showInBanner 
                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        title={announcement.showInBanner ? "배너에서 내리기" : "배너로 지정하기"}
                      >
                        {announcement.showInBanner ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleOpenModal(announcement)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100"
                        title="수정"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Announcement Add/Edit Modal */}
      {isModalOpen && currentAnnouncement && (
        <div 
          id="announcement-modal-overlay"
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
        >
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">
                {isEditMode ? '공지사항 수정' : '새 공지사항 작성'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full -mr-2"
                aria-label="Close modal"
              >
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAnnouncement(); }} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentAnnouncement.title || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400 transition-all"
                  placeholder="공지사항 제목을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={8}
                  value={currentAnnouncement.content || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400 transition-all resize-y"
                  placeholder="공지사항 내용을 입력하세요..."
                />
              </div>

              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700 mb-1">
                  대상
                </label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={currentAnnouncement.targetAudience || 'all'}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                >
                  <option value="all">전체</option>
                  <option value="members">회원</option>
                  <option value="staff">직원</option>
                  {/* Add more specific roles/groups if needed */}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400 transition-all"
                  placeholder="예: 일반, 이벤트, 시스템"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400 transition-all"
                  placeholder="예: 점검,중요,긴급"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all"
                >
                  {isEditMode ? '변경사항 저장' : '공지사항 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;
