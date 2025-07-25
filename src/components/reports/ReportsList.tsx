import { useState, useEffect } from 'react';
import { 
  Search, Filter, FileText, Calendar, 
  Clock, User, ChevronDown, ChevronUp, 
  Check, X, AlertCircle, Send
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx';
import { useReport, Report, ReportStatus, ReportType, ReportCategory } from '../../contexts/ReportContext';
import { useAuth } from '../../contexts/AuthContext';

interface ReportsListProps {
  onSelectReport: (report: Report) => void;
  onCreateReport: () => void;
}

const ReportsList = ({ onSelectReport, onCreateReport }: ReportsListProps) => {
  const { user } = useAuth();
  const { reports, filterReports } = useReport();
  
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'all'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Apply filters when filter criteria changes
  useEffect(() => {
    let filtered = [...reports];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(query) || 
        report.createdByName.toLowerCase().includes(query) ||
        (report.assignedToName && report.assignedToName.toLowerCase().includes(query)) ||
        (report.content && report.content.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(report => report.category === filterCategory);
    }
    
    // Apply date filter
    if (filterDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filterDate === 'today') {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.createdAt);
          reportDate.setHours(0, 0, 0, 0);
          return reportDate.getTime() === today.getTime();
        });
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.createdAt);
          return reportDate >= weekAgo;
        });
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.createdAt);
          return reportDate >= monthAgo;
        });
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    setFilteredReports(filtered);
  }, [reports, searchQuery, filterStatus, filterType, filterCategory, filterDate, sortBy, sortOrder]);
  
  // Toggle sort order or change sort field
  const handleSort = (field: 'createdAt' | 'updatedAt' | 'title') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Helper functions for display text
  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case 'draft': return '작성 중';
      case 'submitted': return '제출됨';
      case 'reviewed': return '검토됨';
      case 'approved': return '승인됨';
      case 'rejected': return '반려됨';
    }
  };
  
  const getTypeText = (type: ReportType) => {
    switch (type) {
      case 'daily': return '일일 보고서';
      case 'weekly': return '주간 보고서';
      case 'monthly': return '월간 보고서';
      case 'performance': return '성과 보고서';
      case 'incident': return '사건 보고서';
      case 'custom': return '커스텀 보고서';
    }
  };
  
  const getCategoryText = (category: ReportCategory) => {
    switch (category) {
      case 'trainer': return '트레이너';
      case 'facility': return '시설';
      case 'client': return '고객';
      case 'financial': return '재정';
      case 'operational': return '운영';
    }
  };
  
  // Style helpers
  const getStatusBadgeStyle = (status: ReportStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };
  
  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'draft': return <FileText size={16} />;
      case 'submitted': return <Send size={16} />;
      case 'reviewed': return <User size={16} />;
      case 'approved': return <Check size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
    }
  };
  
  // Card style based on report status
  const getReportCardClass = (report: Report) => {
    switch (report.status) {
      case 'approved':
        return 'border-l-4 border-l-green-500';
      case 'rejected':
        return 'border-l-4 border-l-red-500';
      case 'submitted':
        return 'border-l-4 border-l-blue-500';
      case 'reviewed':
        return 'border-l-4 border-l-purple-500';
      default:
        return 'border-l-4 border-l-slate-300';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="보고서 제목 또는 담당자/작성자 이름 검색"
            className="form-input w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline inline-flex items-center"
          >
            <Filter size={16} className="mr-2" />
            필터
            {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
          
          <button 
            onClick={onCreateReport}
            className="btn btn-primary inline-flex items-center"
          >
            <FileText size={16} className="mr-2" />
            보고서 작성
          </button>
        </div>
      </div>
      
      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                상태
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 상태</option>
                <option value="draft">작성 중</option>
                <option value="submitted">제출됨</option>
                <option value="reviewed">검토됨</option>
                <option value="approved">승인됨</option>
                <option value="rejected">반려됨</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                보고서 유형
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ReportType | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 유형</option>
                <option value="daily">일일 보고서</option>
                <option value="weekly">주간 보고서</option>
                <option value="monthly">월간 보고서</option>
                <option value="performance">성과 보고서</option>
                <option value="incident">사건 보고서</option>
                <option value="custom">커스텀 보고서</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                카테고리
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ReportCategory | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 카테고리</option>
                <option value="trainer">트레이너</option>
                <option value="facility">시설</option>
                <option value="client">고객</option>
                <option value="financial">재정</option>
                <option value="operational">운영</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                기간
              </label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as 'all' | 'today' | 'week' | 'month')}
                className="form-input w-full"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 1주일</option>
                <option value="month">최근 1개월</option>
              </select>
            </div>
          </div>
          
          {/* Sort options */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleSort('updatedAt')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm flex items-center',
                sortBy === 'updatedAt' ? 'bg-slate-200' : 'bg-slate-100'
              )}
            >
              최근 수정순
              {sortBy === 'updatedAt' && (
                sortOrder === 'desc' ? <ChevronDown size={16} className="ml-1" /> : <ChevronUp size={16} className="ml-1" />
              )}
            </button>
            
            <button
              onClick={() => handleSort('createdAt')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm flex items-center',
                sortBy === 'createdAt' ? 'bg-slate-200' : 'bg-slate-100'
              )}
            >
              작성일순
              {sortBy === 'createdAt' && (
                sortOrder === 'desc' ? <ChevronDown size={16} className="ml-1" /> : <ChevronUp size={16} className="ml-1" />
              )}
            </button>
            
            <button
              onClick={() => handleSort('title')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm flex items-center',
                sortBy === 'title' ? 'bg-slate-200' : 'bg-slate-100'
              )}
            >
              제목순
              {sortBy === 'title' && (
                sortOrder === 'desc' ? <ChevronDown size={16} className="ml-1" /> : <ChevronUp size={16} className="ml-1" />
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Reports list */}
      <div className="space-y-3">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <div
              key={report.id}
              className={clsx(
                "bg-white rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow",
                getReportCardClass(report)
              )}
              onClick={() => onSelectReport(report)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div className={clsx(
                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                    report.status === 'approved' && "bg-green-100 text-green-700",
                    report.status === 'rejected' && "bg-red-100 text-red-700",
                    report.status === 'submitted' && "bg-blue-100 text-blue-700",
                    report.status === 'reviewed' && "bg-purple-100 text-purple-700",
                    report.status === 'draft' && "bg-slate-100 text-slate-700"
                  )}>
                    {getStatusIcon(report.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {report.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getStatusBadgeStyle(report.status)
                      )}>
                        {getStatusText(report.status)}
                      </span>
                      
                      <span className="text-xs text-slate-500">
                        {getTypeText(report.type)}
                      </span>
                      
                      <span className="text-xs text-slate-500">
                        {getCategoryText(report.category)}
                      </span>
                      
                      {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {report.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {report.tags.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{report.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{report.createdByName}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar size={14} />
                    <span>{format(new Date(report.createdAt), 'yyyy.MM.dd')}</span>
                  </div>
                </div>
              </div>
              
              {/* Content preview */}
              <div className="mt-2">
                <p className="text-slate-600 text-sm line-clamp-2">
                  {report.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-slate-500">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all' || filterDate !== 'all'
                ? '검색 결과가 없습니다. 필터를 조정해 보세요.'
                : '보고서가 없습니다. 새 보고서를 작성해 보세요.'}
            </p>
            {(searchQuery || filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all' || filterDate !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterType('all');
                  setFilterCategory('all');
                  setFilterDate('all');
                }}
                className="mt-2 text-primary hover:text-primary-dark"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsList; 