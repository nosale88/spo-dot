import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  User,
  Eye,
  Filter,
  Search,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  authorId: string;
  authorName: string;
  authorDepartment: string;
}

const DailyReportManagement = () => {
  const [selectedReport, setSelectedReport] = useState<DailyReportData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // 임시 데이터 (실제로는 API에서 가져올 데이터)
  const [allReports] = useState<DailyReportData[]>([
    {
      id: 'report-1',
      title: '2024년 12월 28일 업무 보고',
      completed: '회원 관리 시스템 버그 수정 완료\n- 로그인 오류 해결\n- 회원 정보 수정 기능 개선',
      inProgress: '새로운 PT 프로그램 기획\n- 시니어 회원 전용 프로그램 설계 중\n- 트레이너와 협의 진행',
      planned: '내일 트레이너 교육 세션 준비\n- 교육 자료 최종 검토\n- 장비 점검 일정 확인',
      issues: '헬스장 에어컨 소음 문제로 회원 불만 접수\n건의사항: 새로운 운동 기구 도입 검토 필요',
      reportDate: '2024-12-28',
      images: [],
      createdAt: '2024-12-28T18:30:00Z',
      status: 'submitted',
      authorId: 'user1',
      authorName: '김철수',
      authorDepartment: '운영팀'
    },
    {
      id: 'report-2',
      title: '2024년 12월 28일 PT 업무 보고',
      completed: '오전 PT 세션 5건 완료\n회원 상담 3건 진행\n운동 프로그램 개선안 작성',
      inProgress: '신규 회원 PT 프로그램 설계\n기존 회원 진도 체크 및 조정',
      planned: '내일 그룹 PT 수업 준비\n새로운 운동법 연구',
      issues: '특별한 이슈 없음',
      reportDate: '2024-12-28',
      images: [
        { name: 'workout1.jpg', size: 1024000, url: '/api/placeholder/400/300' },
        { name: 'training2.jpg', size: 2048000, url: '/api/placeholder/400/300' }
      ],
      createdAt: '2024-12-28T19:15:00Z',
      status: 'submitted',
      authorId: 'user2',
      authorName: '이영희',
      authorDepartment: 'PT팀'
    },
    {
      id: 'report-3',
      title: '2024년 12월 27일 영업 업무 보고',
      completed: '신규 회원 가입 상담 7건\n기존 회원 상담 4건\n마케팅 자료 업데이트',
      inProgress: '연말 이벤트 기획\n신규 회원 할인 프로모션 준비',
      planned: '내일 신규 회원 시설 안내\n회원 만족도 조사 실시',
      issues: '주차 공간 부족으로 회원 불편 호소',
      reportDate: '2024-12-27',
      images: [],
      createdAt: '2024-12-27T17:45:00Z',
      status: 'submitted',
      authorId: 'user3',
      authorName: '박민수',
      authorDepartment: '영업팀'
    },
    {
      id: 'report-4',
      title: '2024년 12월 28일 임시 보고서',
      completed: '장비 점검 진행 중',
      inProgress: '새로운 운동 기구 설치 준비',
      planned: '내일 완료 예정',
      issues: '',
      reportDate: '2024-12-28',
      images: [],
      createdAt: '2024-12-28T14:20:00Z',
      status: 'draft',
      authorId: 'user4',
      authorName: '정수진',
      authorDepartment: '시설관리팀'
    }
  ]);

  const departments = ['전체', '운영팀', 'PT팀', '영업팀', '시설관리팀'];
  const statuses = ['전체', '제출됨', '임시저장'];

  // 필터링된 보고서
  const filteredReports = useMemo(() => {
    return allReports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !selectedDate || report.reportDate === selectedDate;
      const matchesDepartment = !selectedDepartment || selectedDepartment === '전체' || 
                               report.authorDepartment === selectedDepartment;
      const matchesStatus = !selectedStatus || selectedStatus === '전체' || 
                           (selectedStatus === '제출됨' && report.status === 'submitted') ||
                           (selectedStatus === '임시저장' && report.status === 'draft');
      
      return matchesSearch && matchesDate && matchesDepartment && matchesStatus;
    });
  }, [allReports, searchTerm, selectedDate, selectedDepartment, selectedStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const toggleCardExpansion = (reportId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const exportReports = () => {
    // 엑셀 내보내기 기능 (실제 구현 시 라이브러리 사용)
    console.log('보고서 내보내기');
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <FileText className="h-8 w-8 mr-3 text-blue-600" />
          일일 업무 보고 관리
        </h1>
        <button
          onClick={exportReports}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download size={18} />
          <span>내보내기</span>
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 검색 */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="보고서 제목이나 작성자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* 날짜 필터 */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* 부서 필터 */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {departments.map(dept => (
                <option key={dept} value={dept === '전체' ? '' : dept}>{dept}</option>
              ))}
            </select>
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* 상태 필터 */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {statuses.map(status => (
                <option key={status} value={status === '전체' ? '' : status}>{status}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* 검색 결과 요약 */}
        <div className="mt-4 text-sm text-slate-600">
          총 <span className="font-semibold text-blue-600">{filteredReports.length}</span>개의 보고서가 검색되었습니다.
        </div>
      </div>

      {/* 보고서 목록 */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">검색 조건에 맞는 보고서가 없습니다</p>
            <p className="text-slate-400 text-sm">다른 검색 조건을 시도해보세요</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 보고서 헤더 */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="text-lg font-semibold text-slate-900 text-left hover:underline focus:outline-none"
                      >
                        {report.title}
                      </button>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status === 'submitted' ? '제출됨' : '임시저장'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{report.authorName} ({report.authorDepartment})</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>보고일: {formatDate(report.reportDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>작성일: {formatDateTime(report.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        <span>첨부: {report.images.length}개</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="상세 보기"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCardExpansion(report.id);
                      }}
                      className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                      title={expandedCards.has(report.id) ? "접기" : "펼치기"}
                    >
                      {expandedCards.has(report.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 보고서 미리보기 (펼쳐진 경우) */}
              <AnimatePresence>
                {expandedCards.has(report.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-100"
                  >
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-slate-800 mb-2">완료한 업무</h4>
                          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg line-clamp-3">
                            {report.completed || '작성된 내용이 없습니다.'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 mb-2">진행 중인 업무</h4>
                          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg line-clamp-3">
                            {report.inProgress || '작성된 내용이 없습니다.'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 mb-2">예정된 업무</h4>
                          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg line-clamp-3">
                            {report.planned || '작성된 내용이 없습니다.'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 mb-2">특이사항</h4>
                          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg line-clamp-3">
                            {report.issues || '작성된 내용이 없습니다.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* 상세 보기 모달 */}
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
                      <User className="h-4 w-4 mr-1" />
                      {selectedReport.authorName} ({selectedReport.authorDepartment})
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      보고일: {formatDate(selectedReport.reportDate)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
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
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">완료한 업무</h3>
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

                {/* 예정된 업무 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">예정된 업무</h3>
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
                      <ImageIcon className="h-5 w-5 mr-2" />
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
    </div>
  );
};

export default DailyReportManagement; 