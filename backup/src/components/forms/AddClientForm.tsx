import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface AddClientFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddClientForm = ({ onClose, onSubmit }: AddClientFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    membershipType: 'basic',
    trainerName: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            고객 추가
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              이름
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input pl-10"
                placeholder="고객 이름을 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              이메일
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input pl-10"
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              전화번호
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input pl-10"
                placeholder="전화번호를 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              주소
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input pl-10"
                placeholder="주소를 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              멤버십 유형
            </label>
            <select
              value={formData.membershipType}
              onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
              className="form-input"
            >
              <option value="basic">기본 회원</option>
              <option value="premium">프리미엄 회원</option>
              <option value="vip">VIP 회원</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              담당 트레이너
            </label>
            <select
              value={formData.trainerName}
              onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
              className="form-input"
            >
              <option value="">선택하세요</option>
              <option value="김철수">김철수</option>
              <option value="이영희">이영희</option>
              <option value="박지민">박지민</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              메모
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-slate-400" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input pl-10 h-24"
                placeholder="고객에 대한 메모를 입력하세요"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              고객 추가
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddClientForm;