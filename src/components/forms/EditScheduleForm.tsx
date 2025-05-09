import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, Repeat, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useSchedule, Schedule, SessionType, RecurrenceType } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

interface EditScheduleFormProps {
  schedule: Schedule;
  onClose: () => void;
}

const EditScheduleForm = ({ schedule, onClose }: EditScheduleFormProps) => {
  const { updateSchedule } = useSchedule();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    clientName: schedule.clientName,
    type: schedule.type,
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    notes: schedule.notes || '',
    isCompleted: schedule.isCompleted
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSchedule(schedule.id, {
      clientName: formData.clientName,
      type: formData.type,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
      isCompleted: formData.isCompleted
    });
    
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
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            일정 수정
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
              고객 이름
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="form-input pl-10"
                placeholder="고객 이름을 입력하세요"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              세션 유형
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
              className="form-input"
            >
              <option value="PT">PT 세션</option>
              <option value="OT">OT 세션</option>
              <option value="GROUP">그룹 수업</option>
              <option value="CONSULT">상담</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              날짜
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                시작 시간
              </label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                종료 시간
              </label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="form-input pl-10"
                />
              </div>
            </div>
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
                placeholder="세션에 대한 메모를 입력하세요"
              />
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isCompleted"
              checked={formData.isCompleted}
              onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <label htmlFor="isCompleted" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              완료됨으로 표시
            </label>
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
              저장
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditScheduleForm; 