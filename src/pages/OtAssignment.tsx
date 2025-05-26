import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOT, OTMember } from '../contexts/OTContext';
import { useUser } from '../contexts/UserContext';
import { Eye, UserCheck, Clock, Phone, Calendar, Edit, Save, X, Plus, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

const DAYS_OF_WEEK = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '평일', '주말'];
const TIME_SLOTS = [
  '오전 9시-11시', '오전 10시-12시', '오전 11시-1시',
  '오후 1시-3시', '오후 2시-4시', '오후 3시-5시',
  '저녁 6시-8시', '저녁 7시-9시', '저녁 8시-10시'
];

// OT 회원 추가 모달 컴포넌트
interface AddOTMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddOTMemberModal = ({ isOpen, onClose }: AddOTMemberModalProps) => {
  const { addOTMember } = useOT();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    otCount: 8,
    preferredDays: [] as string[],
    preferredTimes: [] as string[],
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('이름과 연락처는 필수입니다.');
      return;
    }

    addOTMember({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      otCount: formData.otCount,
      totalSessions: formData.otCount,
      preferredDays: formData.preferredDays,
      preferredTimes: formData.preferredTimes,
      notes: formData.notes,
      status: 'pending'
    });

    // 폼 초기화
    setFormData({
      name: '',
      phone: '',
      email: '',
      otCount: 8,
      preferredDays: [],
      preferredTimes: [],
      notes: ''
    });

    onClose();
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const toggleTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <UserPlus size={20} className="mr-2 text-blue-500" />
            OT 회원 추가
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input w-full"
                placeholder="회원 이름"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input w-full"
                placeholder="010-0000-0000"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input w-full"
                placeholder="example@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OT 횟수
              </label>
              <input
                type="number"
                value={formData.otCount}
                onChange={(e) => setFormData({ ...formData, otCount: parseInt(e.target.value) || 0 })}
                className="form-input w-full"
                min="1"
                max="50"
              />
            </div>
          </div>

          {/* 희망 요일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">희망 요일</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 text-sm rounded ${
                    formData.preferredDays.includes(day)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 희망 시간대 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">희망 시간대</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className={`px-3 py-1 text-sm rounded ${
                    formData.preferredTimes.includes(time)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* 특이사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea w-full"
              rows={3}
              placeholder="회원의 특이사항, 운동 목표, 주의사항 등을 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <UserPlus size={16} className="mr-2" />
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function OtAssignment() {
  const { user, isAdmin } = useAuth();
  const { staff: staffList } = useUser();
  const { 
    otMembers, 
    otProgress, 
    updateOTMember, 
    updateProgress, 
    addSession, 
    updateSession 
  } = useOT();

  const [toast, setToast] = useState<string|null>(null);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<OTMember>>({});
  const [showProgressModal, setShowProgressModal] = useState<string | null>(null);
  const [newSessionData, setNewSessionData] = useState({ date: '', time: '', notes: '' });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'assigned' | 'completed'>('all');

  // 권한에 따른 기본 회원 목록 (상태 필터 적용 전)
  const baseMembers = (() => {
    if (!isAdmin && user) {
      // user.id는 string이므로 assignments와 비교할 때 타입 맞춤
      const userStaffId = user.id;
      return otMembers.filter(member => 
        member.assignedStaffId === userStaffId
      );
    }
    return otMembers;
  })();

  // 상태 필터가 적용된 최종 회원 목록
  const filteredMembers = statusFilter === 'all' 
    ? baseMembers 
    : baseMembers.filter(member => member.status === statusFilter);

  // 통계 카드 클릭 핸들러
  const handleStatusFilterClick = (status: 'all' | 'pending' | 'assigned' | 'completed') => {
    setStatusFilter(status);
  };

  const handleAssign = (memberId: number, staffId: string) => {
    if (!isAdmin) {
      setToast('권한이 없습니다. 관리자만 배정할 수 있습니다.');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // OTMember의 assignedStaffId 직접 업데이트
    updateOTMember(memberId, { 
      assignedStaffId: staffId, 
      status: 'assigned' 
    });
    
    setToast('담당자 배정 완료!');
    setTimeout(() => setToast(null), 1200);
  };

  const handleEditMember = (member: OTMember) => {
    if (!isAdmin) {
      setToast('권한이 없습니다. 관리자만 수정할 수 있습니다.');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    
    setEditingMember(member.id);
    setEditData({
      preferredDays: member.preferredDays || [],
      preferredTimes: member.preferredTimes || [],
      notes: member.notes || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingMember) {
      updateOTMember(editingMember, editData);
      setEditingMember(null);
      setEditData({});
      setToast('회원 정보가 업데이트되었습니다.');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleContactUpdate = (progressKey: string, contactData: { contactMade: boolean; contactDate?: string; contactNotes?: string }) => {
    updateProgress(progressKey, contactData);
    setToast('연락 기록이 업데이트되었습니다.');
    setTimeout(() => setToast(null), 2000);
  };

  const handleAddSession = (progressKey: string) => {
    if (!newSessionData.date || !newSessionData.time) {
      setToast('날짜와 시간을 입력해주세요.');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    addSession(progressKey, {
      date: newSessionData.date,
      time: newSessionData.time,
      completed: false,
      notes: newSessionData.notes
    });

    setNewSessionData({ date: '', time: '', notes: '' });
    setToast('세션이 추가되었습니다.');
    setTimeout(() => setToast(null), 2000);
  };

  const handleSessionComplete = (progressKey: string, sessionId: string, completed: boolean) => {
    updateSession(progressKey, sessionId, { completed });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'assigned': return '배정됨';
      case 'completed': return '완료';
      default: return '알 수 없음';
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">OT 배정 관리</h2>
          <p className="text-gray-600 mt-1">
            {isAdmin ? '회원의 OT 담당자를 배정하고 관리할 수 있습니다.' : '본인에게 배정된 OT 현황을 확인하고 진행 상황을 기록할 수 있습니다.'}
          </p>
          {statusFilter !== 'all' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">필터:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                statusFilter === 'assigned' ? 'bg-blue-100 text-blue-800' :
                statusFilter === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {statusFilter === 'pending' ? '배정 대기' :
                 statusFilter === 'assigned' ? '배정 완료' :
                 statusFilter === 'completed' ? '완료' : '전체'}
              </span>
              <button
                onClick={() => handleStatusFilterClick('all')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                전체 보기
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus size={16} />
              OT 회원 추가
            </button>
          )}
          
          {!isAdmin && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <Eye size={16} className="mr-2" />
              <span className="text-sm font-medium">진행 상황 관리</span>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <UserCheck size={16} className="mr-2" />
          {toast}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => handleStatusFilterClick('all')}
          className={`bg-white p-4 rounded-xl shadow border hover:shadow-lg transition-all duration-200 text-left ${
            statusFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{isAdmin ? '전체 OT 회원' : '배정받은 OT'}</p>
              <p className="text-2xl font-bold text-gray-900">{baseMembers.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${statusFilter === 'all' ? 'bg-blue-200' : 'bg-blue-100'}`}>
              <UserCheck className="text-blue-600" size={20} />
            </div>
          </div>
          {statusFilter === 'all' && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              ✓ 선택됨
            </div>
          )}
        </button>
        
        <button
          onClick={() => handleStatusFilterClick('pending')}
          className={`bg-white p-4 rounded-xl shadow border hover:shadow-lg transition-all duration-200 text-left ${
            statusFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">배정 대기</p>
              <p className="text-2xl font-bold text-yellow-600">
                {baseMembers.filter(m => m.status === 'pending').length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${statusFilter === 'pending' ? 'bg-yellow-200' : 'bg-yellow-100'}`}>
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          {statusFilter === 'pending' && (
            <div className="mt-2 text-xs text-yellow-600 font-medium">
              ✓ 선택됨
            </div>
          )}
        </button>
        
        <button
          onClick={() => handleStatusFilterClick('assigned')}
          className={`bg-white p-4 rounded-xl shadow border hover:shadow-lg transition-all duration-200 text-left ${
            statusFilter === 'assigned' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">배정 완료</p>
              <p className="text-2xl font-bold text-blue-600">
                {baseMembers.filter(m => m.status === 'assigned').length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${statusFilter === 'assigned' ? 'bg-blue-200' : 'bg-blue-100'}`}>
              <UserCheck className="text-blue-600" size={20} />
            </div>
          </div>
          {statusFilter === 'assigned' && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              ✓ 선택됨
            </div>
          )}
        </button>
        
        <button
          onClick={() => handleStatusFilterClick('completed')}
          className={`bg-white p-4 rounded-xl shadow border hover:shadow-lg transition-all duration-200 text-left ${
            statusFilter === 'completed' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">완료</p>
              <p className="text-2xl font-bold text-green-600">
                {baseMembers.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${statusFilter === 'completed' ? 'bg-green-200' : 'bg-green-100'}`}>
              <UserCheck className="text-green-600" size={20} />
            </div>
          </div>
          {statusFilter === 'completed' && (
            <div className="mt-2 text-xs text-green-600 font-medium">
              ✓ 선택됨
            </div>
          )}
        </button>
      </div>

      {/* OT 회원 목록 */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl shadow border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <UserCheck size={48} className="mx-auto" />
          </div>
                     <h3 className="text-lg font-medium text-gray-900 mb-2">
             {isAdmin ? (
               statusFilter === 'all' ? 'OT 회원이 없습니다' : 
               statusFilter === 'pending' ? '배정 대기 중인 회원이 없습니다' :
               statusFilter === 'assigned' ? '배정 완료된 회원이 없습니다' :
               '완료된 회원이 없습니다'
             ) : (
               statusFilter === 'all' ? '배정받은 OT가 없습니다' :
               statusFilter === 'pending' ? '배정 대기 중인 OT가 없습니다' :
               statusFilter === 'assigned' ? '진행 중인 OT가 없습니다' :
               '완료된 OT가 없습니다'
             )}
           </h3>
           <p className="text-gray-500 mb-4">
             {isAdmin 
               ? (statusFilter === 'all' ? 'OT 회원을 추가해보세요.' : '다른 상태의 회원을 확인해보세요.')
               : (statusFilter === 'all' ? '관리자가 OT를 배정할 때까지 기다려주세요.' : '다른 상태의 OT를 확인해보세요.')
             }
           </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => handleStatusFilterClick('all')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              전체 회원 보기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredMembers.map(member => {
          const assignedStaff = member.assignedStaffId ? staffList?.find(s => s.id === member.assignedStaffId) : null;
          const progressKey = assignedStaff ? `${member.id}-${assignedStaff.id}` : '';
          const progress = progressKey ? otProgress[progressKey] : null;
          const isEditing = editingMember === member.id;
          
          return (
            <div key={member.id} className="bg-white rounded-xl shadow border hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* 회원 정보 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone size={14} className="mr-1" />
                      <span className="text-sm">{member.phone}</span>
                    </div>
                    <div className="text-xs text-gray-500">등록일: {member.registeredAt}</div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleEditMember(member)}
                      className="text-blue-500 hover:text-blue-600 p-1"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>

                {/* 희망 일정 정보 */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">희망 일정</h4>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">희망 요일</label>
                        <div className="flex flex-wrap gap-1">
                          {DAYS_OF_WEEK.map(day => (
                            <button
                              key={day}
                              onClick={() => {
                                const currentDays = editData.preferredDays || [];
                                const newDays = currentDays.includes(day)
                                  ? currentDays.filter(d => d !== day)
                                  : [...currentDays, day];
                                setEditData({ ...editData, preferredDays: newDays });
                              }}
                              className={`px-2 py-1 text-xs rounded ${
                                (editData.preferredDays || []).includes(day)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">희망 시간대</label>
                        <div className="flex flex-wrap gap-1">
                          {TIME_SLOTS.map(time => (
                            <button
                              key={time}
                              onClick={() => {
                                const currentTimes = editData.preferredTimes || [];
                                const newTimes = currentTimes.includes(time)
                                  ? currentTimes.filter(t => t !== time)
                                  : [...currentTimes, time];
                                setEditData({ ...editData, preferredTimes: newTimes });
                              }}
                              className={`px-2 py-1 text-xs rounded ${
                                (editData.preferredTimes || []).includes(time)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">특이사항</label>
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          className="w-full text-xs border rounded px-2 py-1"
                          rows={2}
                          placeholder="특이사항을 입력하세요"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          <Save size={12} />
                          저장
                        </button>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                        >
                          <X size={12} />
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-600">희망 요일: </span>
                        <span className="text-xs text-gray-800">
                          {member.preferredDays?.join(', ') || '미설정'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">희망 시간: </span>
                        <span className="text-xs text-gray-800">
                          {member.preferredTimes?.join(', ') || '미설정'}
                        </span>
                      </div>
                      {member.notes && (
                        <div>
                          <span className="text-xs text-gray-600">특이사항: </span>
                          <span className="text-xs text-gray-800">{member.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 담당자 배정 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                  {isAdmin ? (
                                        <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={member.assignedStaffId || ''}
                      onChange={e => handleAssign(member.id, e.target.value)}
                    >
                      <option value="">담당자 선택</option>
                      {staffList?.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.department || '부서 미지정'})
                        </option>
                      ))}
              </select>
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
                      {assignedStaff ? `${assignedStaff.name} (${assignedStaff.department})` : '미배정'}
                    </div>
                  )}
                </div>

                {/* 진행 상황 */}
                {assignedStaff && progress && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-800">진행 상황</h4>
                      <button
                        onClick={() => setShowProgressModal(progressKey)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        상세보기
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {progress.contactMade ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <AlertCircle size={14} className="text-red-500" />
                        )}
                        <span className="text-xs text-gray-700">
                          고객 연락: {progress.contactMade ? '완료' : '미완료'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-700">
                        진행: {progress.completedSessions}/{progress.totalSessions} 회
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(progress.completedSessions / progress.totalSessions) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 배정 상태 및 액션 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {assignedStaff ? (
                      <div className="flex items-center text-green-600">
                        <UserCheck size={16} className="mr-1" />
                        <span className="text-sm font-medium">배정 완료</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <Clock size={16} className="mr-1" />
                        <span className="text-sm">미배정</span>
                      </div>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        assignedStaff 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={!!assignedStaff}
                      onClick={() => {
                        if (!member.assignedStaffId) {
                          showToast('담당자를 먼저 선택해주세요!');
                        }
                      }}
                    >
                      {assignedStaff ? '배정됨' : '배정하기'}
                    </button>
                  )}
                </div>
              </div>
            </div>
                      );
          })}
        </div>
      )}

      {/* OT 회원 추가 모달 */}
      <AddOTMemberModal 
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />

      {/* 진행 상황 상세 모달 */}
      {showProgressModal && otProgress[showProgressModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">OT 진행 상황</h3>
              <button
                onClick={() => setShowProgressModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {(() => {
                const progress = otProgress[showProgressModal];
                const member = otMembers.find(m => m.id === progress.memberId);
                const staff = staffList?.find(s => s.id === member?.assignedStaffId);
                
                return (
                  <>
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">회원 정보</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div><span className="font-medium">이름:</span> {member?.name}</div>
                          <div><span className="font-medium">연락처:</span> {member?.phone}</div>
                          <div><span className="font-medium">담당자:</span> {staff?.name} ({staff?.department})</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">진행 현황</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div><span className="font-medium">총 세션:</span> {progress.totalSessions}회</div>
                          <div><span className="font-medium">완료:</span> {progress.completedSessions}회</div>
                          <div><span className="font-medium">잔여:</span> {progress.totalSessions - progress.completedSessions}회</div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                            <div 
                              className="bg-blue-500 h-3 rounded-full"
                              style={{ width: `${(progress.completedSessions / progress.totalSessions) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 연락 기록 */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">고객 연락 기록</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-4 mb-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={progress.contactMade}
                              onChange={(e) => handleContactUpdate(showProgressModal, { 
                                contactMade: e.target.checked,
                                contactDate: e.target.checked ? new Date().toISOString().split('T')[0] : undefined
                              })}
                              className="form-checkbox"
                            />
                            <span>고객 연락 완료</span>
                          </label>
                          
                          {progress.contactMade && (
                            <input
                              type="date"
                              value={progress.contactDate || ''}
                              onChange={(e) => handleContactUpdate(showProgressModal, { 
                                contactMade: progress.contactMade,
                                contactDate: e.target.value 
                              })}
                              className="form-input text-sm"
                            />
                          )}
                        </div>
                        
                        {progress.contactMade && (
                          <textarea
                            value={progress.contactNotes || ''}
                            onChange={(e) => handleContactUpdate(showProgressModal, { 
                              contactMade: progress.contactMade,
                              contactDate: progress.contactDate,
                              contactNotes: e.target.value 
                            })}
                            placeholder="연락 내용을 기록하세요..."
                            className="w-full form-textarea"
                            rows={3}
                          />
                        )}
                      </div>
                    </div>

                    {/* 세션 기록 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">세션 기록</h4>
                        <button
                          onClick={() => setNewSessionData({ date: '', time: '', notes: '' })}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <Plus size={16} />
                          세션 추가
                        </button>
                      </div>
                      
                      {/* 새 세션 추가 폼 */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="date"
                            value={newSessionData.date}
                            onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                            className="form-input"
                            placeholder="날짜"
                          />
                          <input
                            type="time"
                            value={newSessionData.time}
                            onChange={(e) => setNewSessionData({ ...newSessionData, time: e.target.value })}
                            className="form-input"
                            placeholder="시간"
                          />
                          <input
                            type="text"
                            value={newSessionData.notes}
                            onChange={(e) => setNewSessionData({ ...newSessionData, notes: e.target.value })}
                            className="form-input"
                            placeholder="메모"
                          />
                          <button
                            onClick={() => handleAddSession(showProgressModal)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            추가
                          </button>
                        </div>
                      </div>
                      
                      {/* 세션 목록 */}
                      <div className="space-y-2">
                        {progress.sessions.map((session, index) => (
                          <div key={session.id} className={`p-3 rounded-lg border ${session.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={session.completed}
                                  onChange={(e) => handleSessionComplete(showProgressModal, session.id, e.target.checked)}
                                  className="form-checkbox"
                                />
                                <div>
                                  <div className="font-medium">
                                    {session.date} {session.time}
                                  </div>
                                  {session.notes && (
                                    <div className="text-sm text-gray-600">{session.notes}</div>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${session.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {session.completed ? '완료' : '예정'}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {progress.sessions.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            등록된 세션이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 담당자 목록 (관리자만) */}
      {isAdmin && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">담당자 목록</h3>
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      담당자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      부서
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      배정된 회원 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      배정된 회원
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffList && staffList.length > 0 ? staffList.map(staff => {
                    const assignedMembers = otMembers.filter(member => 
                      member.assignedStaffId === staff.id
                    );

                    return (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{staff.department || '부서 미지정'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {assignedMembers.length}명
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {assignedMembers.length > 0 
                              ? assignedMembers.map(m => m?.name).join(', ')
                              : '배정된 회원 없음'
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        등록된 직원이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 