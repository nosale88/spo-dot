import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Send, FileText, Calendar, Upload, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useReport, Report, ReportType, ReportCategory } from '../../contexts/ReportContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface ReportFormProps {
  onClose: () => void;
  report?: Report | null; // If provided, we're in edit mode
  defaultType?: ReportType;
}

const ReportForm = ({ onClose, report, defaultType = 'daily' }: ReportFormProps) => {
  const { createReport, updateReport } = useReport();
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const isEditMode = !!report;
  
  const getDefaultTitle = (type: ReportType) => {
    switch (type) {
      case 'daily':
        return `${format(new Date(), 'yyyy-MM-dd')} 일일 업무 보고`;
      case 'weekly':
        return `${format(new Date(), 'yyyy-MM-dd')} 주간 업무 보고`;
      case 'monthly':
        return `${format(new Date(), 'yyyy-MM')} 월간 업무 보고`;
      default:
        return `${format(new Date(), 'yyyy-MM-dd')} 업무 보고`;
    }
  };
  
  const [formData, setFormData] = useState({
    title: report?.title || getDefaultTitle(defaultType),
    content: report?.content || '',
    type: report?.type || defaultType,
    category: report?.category || 'trainer' as ReportCategory,
    tags: report?.tags || [],
    metrics: report?.metrics || {}
  });

  const [newTag, setNewTag] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [newMetricKey, setNewMetricKey] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');

  // For file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // For tags
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  // For metrics
  const addMetric = () => {
    if (newMetricKey.trim() && newMetricValue.trim()) {
      setFormData({
        ...formData,
        metrics: {
          ...formData.metrics,
          [newMetricKey.trim()]: newMetricValue.trim()
        }
      });
      setNewMetricKey('');
      setNewMetricValue('');
    }
  };

  const removeMetric = (key: string) => {
    const updatedMetrics = { ...formData.metrics };
    delete updatedMetrics[key];
    setFormData({
      ...formData,
      metrics: updatedMetrics
    });
  };

  const handleTypeChange = (type: ReportType) => {
    setFormData({
      ...formData,
      type,
      title: isEditMode ? formData.title : getDefaultTitle(type)
    });
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = true) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Handle file uploads in a real app - this is a simplified version
      const attachments = files.map((file, index) => ({
        id: `temp-${index}`,
        reportId: report?.id || `new-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file),
        uploadedBy: user.id,
        uploadedByName: user.name,
        uploadedAt: new Date().toISOString()
      }));
      
      if (isEditMode && report) {
        // Update existing report
        updateReport(report.id, {
          ...formData,
          status: saveAsDraft ? 'draft' : 'submitted',
          submittedAt: saveAsDraft ? undefined : new Date().toISOString(),
          attachments: [...(report.attachments || []), ...attachments]
        });
        
        showToast(
          'success',
          saveAsDraft ? '보고서가 저장되었습니다' : '보고서가 제출되었습니다',
          formData.title
        );
      } else {
        // Create new report
        const reportId = createReport({
          ...formData,
          createdBy: user.id,
          createdByName: user.name,
          status: saveAsDraft ? 'draft' : 'submitted',
          submittedAt: saveAsDraft ? undefined : new Date().toISOString(),
          attachments
        });
        
        showToast(
          'success',
          saveAsDraft ? '보고서가 저장되었습니다' : '보고서가 제출되었습니다',
          formData.title
        );
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving report:', error);
      showToast(
        'error',
        '오류',
        '보고서 저장 중 오류가 발생했습니다'
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            {isEditMode ? '보고서 수정' : '업무 보고서 작성'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, true)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                보고서 종류
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('daily')}
                  className={`p-3 rounded-lg flex items-center justify-center text-sm font-medium ${
                    formData.type === 'daily'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  일일 보고서
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('weekly')}
                  className={`p-3 rounded-lg flex items-center justify-center text-sm font-medium ${
                    formData.type === 'weekly'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  주간 보고서
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('monthly')}
                  className={`p-3 rounded-lg flex items-center justify-center text-sm font-medium ${
                    formData.type === 'monthly'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  월간 보고서
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ReportCategory })}
                className="form-input w-full"
              >
                <option value="trainer">트레이너</option>
                <option value="facility">시설</option>
                <option value="client">고객</option>
                <option value="financial">재정</option>
                <option value="operational">운영</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                보고서 제목
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input w-full"
                placeholder="보고서 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                보고서 내용
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input h-64 w-full"
                placeholder="보고서 내용을 입력하세요"
              />
            </div>

            {/* 태그 섹션 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                태그
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="form-input flex-grow"
                  placeholder="새 태그 추가"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline inline-flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm flex items-center dark:bg-slate-700 dark:text-slate-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 메트릭 섹션 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                메트릭 (선택)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMetricKey}
                  onChange={(e) => setNewMetricKey(e.target.value)}
                  className="form-input w-1/3"
                  placeholder="항목명"
                />
                <input
                  type="text"
                  value={newMetricValue}
                  onChange={(e) => setNewMetricValue(e.target.value)}
                  className="form-input flex-grow"
                  placeholder="값"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMetric())}
                />
                <button
                  type="button"
                  onClick={addMetric}
                  className="btn btn-outline inline-flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {Object.keys(formData.metrics).length > 0 && (
                <div className="mt-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-600">
                        <th className="text-left py-2 px-4 font-medium">항목</th>
                        <th className="text-left py-2 px-4 font-medium">값</th>
                        <th className="text-right py-2 px-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(formData.metrics).map(([key, value]) => (
                        <tr key={key} className="border-b border-slate-200 dark:border-slate-600">
                          <td className="py-2 px-4">{key}</td>
                          <td className="py-2 px-4">{value}</td>
                          <td className="py-2 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeMetric(key)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 첨부파일 섹션 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                첨부파일
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="btn btn-outline inline-flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  파일 선택
                </label>
              </div>
              
              {/* 선택한 파일 목록 */}
              {files.length > 0 && (
                <div className="mt-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 기존 첨부파일 목록 (수정 모드) */}
              {isEditMode && report?.attachments && report.attachments.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">기존 첨부파일</h4>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <ul className="space-y-2">
                      {report.attachments.map((attachment) => (
                        <li key={attachment.id} className="flex items-center justify-between text-sm">
                          <a 
                            href={attachment.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                          >
                            {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(1)} KB)
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary inline-flex items-center"
            >
              <Save size={16} className="mr-2" />
              임시저장
            </button>
            {!isEditMode || report?.status === 'draft' ? (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="btn btn-success inline-flex items-center"
              >
                <Send size={16} className="mr-2" />
                제출하기
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ReportForm; 