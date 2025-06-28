import {
  Bell,
  Megaphone,
  CalendarDays,
  PlusSquare,
  Upload,
  X,
  Image as ImageIcon,
  FileImage,
  Trash2,
  List,
  Eye,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useState, useRef } from 'react';
import AddReportForm from '../components/forms/AddReportForm';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
}

interface DailyReportData {
  id: string;
  title: string;
  completed: string;
  inProgress: string;
  planned: string;
  issues: string;
  reportDate: string;
  images: {
    name: string;
    size: number;
    url: string;
  }[];
  createdAt: string;
  status: 'draft' | 'submitted';
}

const DailyReport = () => {
  const { showToast } = useNotification();
  const [reportTitle, setReportTitle] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [inProgressTasks, setInProgressTasks] = useState('');
  const [plannedTasks, setPlannedTasks] = useState('');
  const [issuesSuggestions, setIssuesSuggestions] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showReportList, setShowReportList] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReportData | null>(null);
  const [savedReports, setSavedReports] = useState<DailyReportData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${
    ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  }요일`;
  const defaultDateValue = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(defaultDateValue);
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);

  // 이미지 업로드 처리
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
      // 파일 타입 검증
      if (!validImageTypes.includes(file.type)) {
        showToast('error', '파일 형식 오류', `${file.name}은 지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.`);
        return;
      }

      // 파일 크기 검증
      if (file.size > maxFileSize) {
        showToast('error', '파일 크기 오류', `${file.name}의 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`);
        return;
      }

      // 중복 파일 검증
      if (uploadedImages.some(img => img.name === file.name && img.size === file.size)) {
        showToast('warning', '중복 파일', `${file.name}은 이미 업로드된 파일입니다.`);
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      const newImage: UploadedImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: imageUrl,
        name: file.name,
        size: file.size
      };

      setUploadedImages(prev => [...prev, newImage]);
    });
  };

  // 이미지 삭제
  const removeImage = (imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  // 파일 사이즈 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    if (!reportTitle.trim()) {
      showToast('error', '입력 오류', '보고서 제목을 입력해주세요.');
      return;
    }

    const reportData: DailyReportData = {
      id: `report-${Date.now()}`,
      title: reportTitle,
      completed: completedTasks,
      inProgress: inProgressTasks,
      planned: plannedTasks,
      issues: issuesSuggestions,
      reportDate: selectedDate,
      images: uploadedImages.map(img => ({
        name: img.name,
        size: img.size,
        url: img.url
      })),
      createdAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    setSavedReports(prev => [reportData, ...prev]);
    
    // 폼 초기화
    setReportTitle('');
    setCompletedTasks('');
    setInProgressTasks('');
    setPlannedTasks('');
    setIssuesSuggestions('');
    setUploadedImages([]);
    
    showToast('success', '보고서 제출 완료', '보고서가 성공적으로 제출되었습니다.');
  };

  const handleSaveDraft = () => {
    if (!reportTitle.trim()) {
      showToast('error', '입력 오류', '보고서 제목을 입력해주세요.');
      return;
    }

    const draftData: DailyReportData = {
      id: `draft-${Date.now()}`,
      title: reportTitle,
      completed: completedTasks,
      inProgress: inProgressTasks,
      planned: plannedTasks,
      issues: issuesSuggestions,
      reportDate: selectedDate,
      images: uploadedImages.map(img => ({
        name: img.name,
        size: img.size,
        url: img.url
      })),
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    setSavedReports(prev => [draftData, ...prev]);
    
    showToast('info', '임시 저장 완료', '보고서가 임시 저장되었습니다.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">일일 업무 보고</h1> 
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

      {/* Daily Report Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-3 sm:mb-0">일일 업무 보고</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input 
                type="date" 
                defaultValue={defaultDateValue} 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
              />
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <button 
              onClick={() => setShowReportList(true)}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <List size={18} />
              <span>목록</span>
            </button>
            <button 
              onClick={() => setIsAddReportModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusSquare size={18} />
              <span>새 보고서</span>
            </button>
          </div>
        </div>

        {/* Report Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="mb-6">
            <label htmlFor="reportTitle" className="block mb-1.5 text-sm font-medium text-slate-700">제목</label>
            <input 
              type="text" 
              id="reportTitle" 
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="업무 보고 제목을 입력하세요"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="completedTasks" className="block mb-1.5 text-sm font-medium text-slate-700">오늘 완료한 업무</label>
            <textarea 
              id="completedTasks" 
              rows={5} 
              value={completedTasks}
              onChange={(e) => setCompletedTasks(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="오늘 완료한 업무를 상세히 작성하세요..."
            />
          </div>

          <div className="mb-6">
            <label htmlFor="inProgressTasks" className="block mb-1.5 text-sm font-medium text-slate-700">진행 중인 업무</label>
            <textarea 
              id="inProgressTasks" 
              rows={5} 
              value={inProgressTasks}
              onChange={(e) => setInProgressTasks(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="현재 진행 중인 업무와 진행 상황을 작성하세요..."
            />
          </div>

          <div className="mb-6">
            <label htmlFor="plannedTasks" className="block mb-1.5 text-sm font-medium text-slate-700">내일 예정된 업무</label>
            <textarea 
              id="plannedTasks" 
              rows={5} 
              value={plannedTasks}
              onChange={(e) => setPlannedTasks(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="내일 예정된 업무 계획을 작성하세요..."
            />
          </div>

          <div className="mb-8">
            <label htmlFor="issuesSuggestions" className="block mb-1.5 text-sm font-medium text-slate-700">특이사항 및 건의사항</label>
            <textarea 
              id="issuesSuggestions" 
              rows={5} 
              value={issuesSuggestions}
              onChange={(e) => setIssuesSuggestions(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              placeholder="업무 중 특이사항이나 건의사항이 있으면 작성하세요..."
            />
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              첨부 이미지 (선택사항)
            </label>
            <div className="space-y-4">
              {/* 파일 업로드 영역 */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                      파일을 선택하거나
                    </span>{' '}
                    드래그해서 업로드하세요
                  </p>
                  <p className="text-xs text-slate-500">
                    JPG, PNG, GIF, WebP (최대 5MB)
                  </p>
                </div>
              </div>

              {/* 업로드된 이미지 미리보기 */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center">
                    <FileImage className="h-4 w-4 mr-1" />
                    업로드된 이미지 ({uploadedImages.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 px-1">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {image.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(image.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              임시저장
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              제출하기
            </button>
          </div>
        </form>
      </section>

      {/* Report List Modal */}
      <AnimatePresence>
        {showReportList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
            onClick={() => setShowReportList(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  업무 보고서 목록
                </h2>
                <button
                  onClick={() => setShowReportList(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {savedReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg mb-2">작성된 보고서가 없습니다</p>
                    <p className="text-slate-400 text-sm">새 보고서를 작성해보세요</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedReports.map((report) => (
                      <div 
                        key={report.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportList(false);
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-slate-900 text-lg hover:text-blue-600 transition-colors">
                            {report.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'submitted' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status === 'submitted' ? '제출됨' : '임시저장'}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 p-1">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>보고일: {formatDate(report.reportDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>작성일: {formatDateTime(report.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            <span>첨부: {report.images.length}개</span>
                          </div>
                        </div>

                        <div className="text-sm text-slate-600">
                          <p className="line-clamp-2">
                            {report.completed ? 
                              `완료업무: ${report.completed.substring(0, 100)}${report.completed.length > 100 ? '...' : ''}` : 
                              '작성된 내용 없음'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedReport.title}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      보고일: {formatDate(selectedReport.reportDate)}
                    </span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      작성일: {formatDateTime(selectedReport.createdAt)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReport.status === 'submitted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedReport.status === 'submitted' ? '제출됨' : '임시저장'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                {/* 완료한 업무 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">오늘 완료한 업무</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedReport.completed || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* 진행 중인 업무 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">진행 중인 업무</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedReport.inProgress || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* 내일 예정된 업무 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">내일 예정된 업무</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedReport.planned || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* 특이사항 및 건의사항 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">특이사항 및 건의사항</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedReport.issues || '작성된 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* 첨부 이미지 */}
                {selectedReport.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                      <FileImage className="h-5 w-5 mr-2" />
                      첨부 이미지 ({selectedReport.images.length}개)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedReport.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-2 px-1">
                            <p className="text-xs font-medium text-slate-700 truncate">
                              {image.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(image.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Report Modal */}
      {isAddReportModalOpen && (
        <AddReportForm 
          onClose={() => setIsAddReportModalOpen(false)} 
          defaultType="daily"
          initialDate={selectedDate} 
        />
      )}
    </div>
  );
};

export default DailyReport;
