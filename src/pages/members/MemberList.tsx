import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Edit, Trash2, Eye, FilterIcon, RefreshCw, Download, Users, Calendar, CreditCard, AlertCircle, CheckCircle2, XCircle, Clock, Mail, Phone, MoreVertical } from 'lucide-react';
import { useMember, Member } from '../../contexts/MemberContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNotification } from '../../contexts/NotificationContext';

// 필터 타입 정의
interface MemberFilters {
  status: string;
  membershipType: string;
  search: string;
  expirationFilter: string;
}

// 회원 상태별 색상
const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800', 
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800'
};

// 회원 상태별 한글명
const statusLabels = {
  active: '활성',
  inactive: '비활성',
  pending: '대기중',
  expired: '만료됨'
};

// 회원권 타입별 한글명
const membershipTypeLabels = {
  basic: '기본 회원권',
  premium: '프리미엄 회원권',
  vip: 'VIP 회원권',
  student: '학생 회원권',
  senior: '시니어 회원권'
};

// 새 회원 등록/수정 모달
interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id'>) => void;
  member?: Member | null;
  mode: 'create' | 'edit';
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSave, member, mode }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    membership_type: 'basic',
    join_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'active' as Member['status'],
    notes: '',
    emergency_contact: '',
    birth_date: '',
    address: ''
  });

  useEffect(() => {
    if (member && mode === 'edit') {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        membership_type: member.membership_type || 'basic',
        join_date: member.join_date || new Date().toISOString().split('T')[0],
        expiry_date: member.expiry_date || '',
        status: member.status || 'active',
        notes: member.notes || '',
        emergency_contact: member.emergency_contact || '',
        birth_date: member.birth_date || '',
        address: member.address || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        membership_type: 'basic',
        join_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        status: 'active',
        notes: '',
        emergency_contact: '',
        birth_date: '',
        address: ''
      });
    }
  }, [member, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? '신규 회원 등록' : '회원 정보 수정'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="010-0000-0000"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">회원권 타입</label>
              <select
                value={formData.membership_type}
                onChange={(e) => setFormData({...formData, membership_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="basic">기본 회원권</option>
                <option value="premium">프리미엄 회원권</option>
                <option value="vip">VIP 회원권</option>
                <option value="student">학생 회원권</option>
                <option value="senior">시니어 회원권</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Member['status']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">대기중</option>
                <option value="expired">만료됨</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
              <input
                type="date"
                value={formData.join_date}
                onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">만료일</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비상연락처</label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="010-0000-0000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="주소를 입력하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="추가 정보나 특이사항을 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {mode === 'create' ? '등록' : '수정'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function MemberList() {
  const { members, setMembers } = useMember();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState<MemberFilters>({
    status: '',
    membershipType: '',
    search: '',
    expirationFilter: ''
  });

  // 회원 통계 계산
  const memberStats = React.useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const expiringSoon = members.filter(m => {
      if (!m.expiry_date) return false;
      const expiryDate = new Date(m.expiry_date);
      const today = new Date();
      const daysUntilExpiry = differenceInDays(expiryDate, today);
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    }).length;
    const expired = members.filter(m => {
      if (!m.expiry_date) return false;
      return isBefore(new Date(m.expiry_date), new Date());
    }).length;

    return { total, active, expiringSoon, expired };
  }, [members]);

  // 필터링된 회원 목록
  const filteredMembers = React.useMemo(() => {
    return members.filter(member => {
      const searchMatch = !filters.search || 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.phone.includes(filters.search);
      
      const statusMatch = !filters.status || member.status === filters.status;
      const membershipMatch = !filters.membershipType || member.membership_type === filters.membershipType;
      
      let expirationMatch = true;
      if (filters.expirationFilter === 'expiring-soon' && member.expiry_date) {
        const expiryDate = new Date(member.expiry_date);
        const today = new Date();
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        expirationMatch = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
      } else if (filters.expirationFilter === 'expired' && member.expiry_date) {
        expirationMatch = isBefore(new Date(member.expiry_date), new Date());
      }

      return searchMatch && statusMatch && membershipMatch && expirationMatch;
    });
  }, [members, filters]);

  // 새 회원 추가
  const handleAddMember = async (newMemberData: Omit<Member, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .insert([newMemberData])
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [...prev, data]);
      showToast('success', '회원 등록 완료', '회원이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('회원 등록 실패:', error);
      showToast('error', '회원 등록 실패', '회원 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원 정보 수정
  const handleEditMember = async (memberData: Omit<Member, 'id'>) => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', selectedMember.id)
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => prev.map(m => m.id === selectedMember.id ? data : m));
      showToast('success', '회원 정보 수정 완료', '회원 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('회원 정보 수정 실패:', error);
      showToast('error', '회원 정보 수정 실패', '회원 정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원 삭제
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('정말로 이 회원을 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      showToast('success', '회원 삭제 완료', '회원이 삭제되었습니다.');
      setOpenDropdown(null);
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      showToast('error', '회원 삭제 실패', '회원 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원권 만료일까지 남은 일수 계산
  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    return differenceInDays(new Date(expiryDate), new Date());
  };

  // 모달 핸들러
  const openCreateModal = () => {
    setSelectedMember(null);
    setModalMode('create');
    setShowMemberModal(true);
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setModalMode('edit');
    setShowMemberModal(true);
    setOpenDropdown(null);
  };

  const handleModalSave = (memberData: Omit<Member, 'id'>) => {
    if (modalMode === 'create') {
      handleAddMember(memberData);
    } else {
      handleEditMember(memberData);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
          <p className="mt-2 text-gray-600">피트니스 센터 회원들을 관리합니다.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={20} />
          신규 회원 등록
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">전체 회원</p>
              <p className="text-3xl font-bold text-gray-900">{memberStats.total}</p>
            </div>
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 회원</p>
              <p className="text-3xl font-bold text-green-600">{memberStats.active}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">곧 만료</p>
              <p className="text-3xl font-bold text-yellow-600">{memberStats.expiringSoon}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">만료됨</p>
              <p className="text-3xl font-bold text-red-600">{memberStats.expired}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호로 검색"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기중</option>
              <option value="expired">만료됨</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">회원권 타입</label>
            <select
              value={filters.membershipType}
              onChange={(e) => setFilters({...filters, membershipType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">모든 타입</option>
              <option value="basic">기본 회원권</option>
              <option value="premium">프리미엄 회원권</option>
              <option value="vip">VIP 회원권</option>
              <option value="student">학생 회원권</option>
              <option value="senior">시니어 회원권</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">만료 상태</label>
            <select
              value={filters.expirationFilter}
              onChange={(e) => setFilters({...filters, expirationFilter: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">모든 회원</option>
              <option value="expiring-soon">곧 만료 (7일 이내)</option>
              <option value="expired">만료됨</option>
            </select>
          </div>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">회원이 없습니다</p>
            <p className="text-gray-400">검색 조건을 변경하거나 새 회원을 등록해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">회원정보</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">연락처</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">회원권</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">가입일</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">만료일</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => {
                  const daysUntilExpiry = getDaysUntilExpiry(member.expiry_date || '');
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
                  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold">
                              {member.last_name?.[0]}{member.first_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {member.last_name} {member.first_name}
                            </p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-1" />
                            {member.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail size={14} className="mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {membershipTypeLabels[member.membership_type as keyof typeof membershipTypeLabels] || member.membership_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.join_date ? format(new Date(member.join_date), 'yyyy.MM.dd', { locale: ko }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-600">
                            {member.expiry_date ? format(new Date(member.expiry_date), 'yyyy.MM.dd', { locale: ko }) : '-'}
                          </span>
                          {daysUntilExpiry !== null && (
                            <span className={clsx(
                              'text-xs',
                              isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'
                            )}>
                              {isExpired ? `${Math.abs(daysUntilExpiry)}일 만료됨` : 
                               isExpiringSoon ? `${daysUntilExpiry}일 남음` : 
                               `${daysUntilExpiry}일 남음`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusColors[member.status as keyof typeof statusColors] || statusColors.inactive
                        )}>
                          {statusLabels[member.status as keyof typeof statusLabels] || member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openDropdown === member.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => openEditModal(member)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <Edit size={14} className="mr-2" />
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <Trash2 size={14} className="mr-2" />
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 회원 등록/수정 모달 */}
      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSave={handleModalSave}
        member={selectedMember}
        mode={modalMode}
      />
    </div>
  );
} 