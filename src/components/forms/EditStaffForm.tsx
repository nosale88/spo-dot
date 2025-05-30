import React, { useState } from 'react';
import { X, User, Mail, Phone, Building, Briefcase, Save } from 'lucide-react';
import { useUser, Staff } from '../../contexts/UserContext';
import { UserPosition, positionInfo } from '../../types/permissions';

interface EditStaffFormProps {
  staff: Staff;
  onClose: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_clients', label: '고객 조회' },
  { id: 'edit_clients', label: '고객 편집' },
  { id: 'view_trainers', label: '트레이너 조회' },
  { id: 'edit_trainers', label: '트레이너 편집' },
  { id: 'view_schedules', label: '일정 조회' },
  { id: 'edit_schedules', label: '일정 편집' },
  { id: 'view_tasks', label: '업무 조회' },
  { id: 'edit_tasks', label: '업무 편집' },
  { id: 'view_reports', label: '보고서 조회' },
  { id: 'edit_reports', label: '보고서 편집' },
  { id: 'view_equipment', label: '장비 조회' },
  { id: 'edit_equipment', label: '장비 편집' },
  { id: 'view_inventory', label: '재고 조회' },
  { id: 'edit_inventory', label: '재고 편집' },
  { id: 'view_payments', label: '결제 조회' },
  { id: 'process_payments', label: '결제 처리' },
];

const EditStaffForm: React.FC<EditStaffFormProps> = ({ staff, onClose }) => {
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: staff.name,
    email: staff.email,
    phone: staff.phone || '',
    department: staff.department || '',
    position: staff.position || '',
    status: staff.status,
    permissions: staff.permissions || []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('이름과 이메일은 필수입니다.');
      return;
    }

    const updatedStaff: Staff = {
      ...staff,
      ...formData
    };

    if (updateUser) {
      updateUser(staff.id, updatedStaff);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <User size={20} className="mr-2 text-blue-500" />
            직원 정보 수정
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="직원 이름"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="이메일 주소"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                전화번호
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                부서
              </label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="부서명"
                />
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">
                직책
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="form-input w-full"
                >
                  <option value="">직책 선택</option>
                  {Object.entries(positionInfo).map(([id, info]) => (
                    <option key={id} value={id}>{info.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                상태
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input w-full"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">보류</option>
                <option value="suspended">정지</option>
              </select>
            </div>
          </div>

          {/* 권한 설정 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">권한 설정</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {AVAILABLE_PERMISSIONS.map(permission => (
                <label key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                    className="form-checkbox text-blue-600 mr-2"
                  />
                  <span className="text-sm text-slate-700">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              <Save size={16} className="mr-2" />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffForm; 