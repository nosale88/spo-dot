import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { formatISO } from 'date-fns';

// 보고서 상태 타입
export type ReportStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';

// 보고서 타입
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'performance' | 'incident' | 'custom';

// 보고서 카테고리
export type ReportCategory = 'trainer' | 'facility' | 'client' | 'financial' | 'operational';

// 보고서 인터페이스
export interface Report {
  id: string;
  title: string;
  content: string;
  type: ReportType;
  category: ReportCategory;
  status: ReportStatus;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  comments?: ReportComment[];
  attachments?: ReportAttachment[];
  metrics?: {
    [key: string]: number | string;
  };
  period?: {
    startDate: string;
    endDate: string;
  };
  tags?: string[];
}

// 보고서 댓글 인터페이스
export interface ReportComment {
  id: string;
  reportId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// 보고서 첨부파일 인터페이스
export interface ReportAttachment {
  id: string;
  reportId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}

// 보고서 템플릿 인터페이스
export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  structure: {
    sections: {
      title: string;
      description?: string;
      type: 'text' | 'metrics' | 'list' | 'table';
      required: boolean;
    }[];
    metrics?: {
      name: string;
      label: string;
      unit?: string;
      type: 'number' | 'percentage' | 'currency' | 'text';
      required: boolean;
    }[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 보고서 필터 옵션 인터페이스
interface ReportFilterOptions {
  type?: ReportType | 'all';
  category?: ReportCategory | 'all';
  status?: ReportStatus | 'all';
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  assignedTo?: string;
  searchQuery?: string;
}

// 리포트 컨텍스트 인터페이스
interface ReportContextType {
  reports: Report[];
  templates: ReportTemplate[];
  filteredReports: Report[];
  
  // 필터링
  filterReports: (options: ReportFilterOptions) => void;
  
  // 보고서 CRUD
  createReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateReport: (id: string, reportData: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => Report | undefined;
  
  // 보고서 상태 변경
  submitReport: (id: string) => void;
  reviewReport: (id: string, reviewerId: string, reviewerName: string, approved: boolean) => void;
  
  // 보고서 댓글
  addComment: (reportId: string, comment: Omit<ReportComment, 'id' | 'reportId' | 'createdAt'>) => string;
  deleteComment: (reportId: string, commentId: string) => void;
  
  // 보고서 첨부파일
  addAttachment: (reportId: string, attachment: Omit<ReportAttachment, 'id' | 'reportId' | 'uploadedAt'>) => string;
  deleteAttachment: (reportId: string, attachmentId: string) => void;
  
  // 템플릿 관리
  createTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTemplate: (id: string, templateData: Partial<ReportTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => ReportTemplate | undefined;
  
  // 통계 및 분석
  getReportStatsByPeriod: (startDate: string, endDate: string) => {
    total: number;
    byStatus: Record<ReportStatus, number>;
    byType: Record<ReportType, number>;
    byCategory: Record<ReportCategory, number>;
  };
  getUserReportStats: (userId: string) => {
    created: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const { users } = useUser();
  
  // 샘플 보고서 템플릿 생성
  const generateSampleTemplates = (): ReportTemplate[] => {
    const now = new Date().toISOString();
    
    return [
      {
        id: 'template-1',
        title: '일일 트레이너 리포트',
        description: '트레이너의 일일 활동 및 성과를 기록하는 템플릿입니다.',
        type: 'daily',
        category: 'trainer',
        structure: {
          sections: [
            {
              title: '요약',
              description: '오늘의 활동 요약을 작성하세요.',
              type: 'text',
              required: true
            },
            {
              title: '진행된 세션',
              description: '오늘 완료한 세션 정보를 작성하세요.',
              type: 'table',
              required: true
            },
            {
              title: '특이사항',
              description: '특별히 보고할 사항이 있으면 작성하세요.',
              type: 'text',
              required: false
            }
          ],
          metrics: [
            {
              name: 'totalSessions',
              label: '총 세션 수',
              type: 'number',
              required: true
            },
            {
              name: 'clientsAttended',
              label: '참석 고객 수',
              type: 'number',
              required: true
            },
            {
              name: 'totalHours',
              label: '총 트레이닝 시간',
              unit: '시간',
              type: 'number',
              required: true
            },
            {
              name: 'satisfactionRate',
              label: '고객 만족도',
              unit: '%',
              type: 'percentage',
              required: false
            }
          ]
        },
        createdBy: 'admin-1',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'template-2',
        title: '주간 운영 보고서',
        description: '센터의 주간 운영 현황을 보고하는 템플릿입니다.',
        type: 'weekly',
        category: 'operational',
        structure: {
          sections: [
            {
              title: '주간 요약',
              description: '이번 주 운영 요약을 작성하세요.',
              type: 'text',
              required: true
            },
            {
              title: '방문자 통계',
              description: '일별 방문 통계를 기록하세요.',
              type: 'table',
              required: true
            },
            {
              title: '시설 이용 현황',
              description: '시설별 이용 현황을 작성하세요.',
              type: 'list',
              required: true
            },
            {
              title: '특이사항 및 개선점',
              description: '특이사항이나 개선이 필요한 사항을 작성하세요.',
              type: 'text',
              required: false
            }
          ],
          metrics: [
            {
              name: 'totalVisitors',
              label: '총 방문자 수',
              type: 'number',
              required: true
            },
            {
              name: 'newMembers',
              label: '신규 회원 수',
              type: 'number',
              required: true
            },
            {
              name: 'revenue',
              label: '매출',
              unit: '원',
              type: 'currency',
              required: true
            },
            {
              name: 'facilityUtilization',
              label: '시설 이용률',
              unit: '%',
              type: 'percentage',
              required: true
            }
          ]
        },
        createdBy: 'admin-1',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'template-3',
        title: '월간 실적 보고서',
        description: '월간 실적 및 KPI 달성 현황을 보고하는 템플릿입니다.',
        type: 'monthly',
        category: 'financial',
        structure: {
          sections: [
            {
              title: '월간 요약',
              description: '한 달간의 실적 요약을 작성하세요.',
              type: 'text',
              required: true
            },
            {
              title: '매출 분석',
              description: '매출 구성 및 분석을 기록하세요.',
              type: 'text',
              required: true
            },
            {
              title: '회원 현황',
              description: '회원 증감 및 유지율을 작성하세요.',
              type: 'text',
              required: true
            },
            {
              title: '마케팅 성과',
              description: '마케팅 활동 및 성과를 작성하세요.',
              type: 'text',
              required: false
            },
            {
              title: '다음 달 계획',
              description: '다음 달 목표 및 전략을 작성하세요.',
              type: 'text',
              required: true
            }
          ],
          metrics: [
            {
              name: 'totalRevenue',
              label: '총 매출',
              unit: '원',
              type: 'currency',
              required: true
            },
            {
              name: 'expenseTotal',
              label: '총 지출',
              unit: '원',
              type: 'currency',
              required: true
            },
            {
              name: 'netProfit',
              label: '순이익',
              unit: '원',
              type: 'currency',
              required: true
            },
            {
              name: 'memberRetentionRate',
              label: '회원 유지율',
              unit: '%',
              type: 'percentage',
              required: true
            },
            {
              name: 'newMemberCount',
              label: '신규 회원 수',
              type: 'number',
              required: true
            }
          ]
        },
        createdBy: 'admin-1',
        createdAt: now,
        updatedAt: now
      }
    ];
  };
  
  // 샘플 보고서 생성
  const generateSampleReports = (): Report[] => {
    const now = new Date().toISOString();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekISO = lastWeek.toISOString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString();
    
    return [
      {
        id: 'report-1',
        title: '6월 15일 트레이너 일일 리포트',
        content: '오늘은 총 6개의 개인 PT 세션을 진행했습니다. 모든 고객이 일정에 참석했으며, 특히 김철수 고객은 목표 체중 감량을 달성했습니다.',
        type: 'daily',
        category: 'trainer',
        status: 'approved',
        createdBy: 'trainer-1',
        createdByName: '박지민',
        createdAt: lastWeekISO,
        updatedAt: lastWeekISO,
        submittedAt: lastWeekISO,
        reviewedAt: yesterdayISO,
        reviewedBy: 'admin-1',
        reviewedByName: '관리자',
        metrics: {
          totalSessions: 6,
          clientsAttended: 6,
          totalHours: 5,
          satisfactionRate: 95
        },
        period: {
          startDate: lastWeekISO.split('T')[0],
          endDate: lastWeekISO.split('T')[0]
        },
        comments: [
          {
            id: 'comment-1',
            reportId: 'report-1',
            content: '좋은 성과입니다. 김철수 고객에게 특별 프로그램을 제안해보세요.',
            createdBy: 'admin-1',
            createdByName: '관리자',
            createdAt: yesterdayISO
          }
        ],
        tags: ['일일보고', '트레이닝', '성과']
      },
      {
        id: 'report-2',
        title: '6월 둘째 주 운영 보고서',
        content: '이번 주 총 방문자 수는 350명으로, 지난 주 대비 5% 증가했습니다. 신규 회원 가입은 12명이 있었으며, 헬스장 이용률이 가장 높았습니다.',
        type: 'weekly',
        category: 'operational',
        status: 'submitted',
        createdBy: 'staff-1',
        createdByName: '이영희',
        assignedTo: 'admin-1',
        assignedToName: '관리자',
        createdAt: yesterdayISO,
        updatedAt: yesterdayISO,
        submittedAt: yesterdayISO,
        metrics: {
          totalVisitors: 350,
          newMembers: 12,
          revenue: 4500000,
          facilityUtilization: 78
        },
        period: {
          startDate: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate() - lastWeek.getDay()).toISOString().split('T')[0],
          endDate: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate() - lastWeek.getDay() + 6).toISOString().split('T')[0]
        },
        tags: ['주간보고', '운영', '통계']
      },
      {
        id: 'report-3',
        title: '5월 월간 실적 보고서',
        content: '5월 총 매출은 2,500만원으로 전월 대비 8% 증가했습니다. PT 세션 매출이 가장 큰 비중을 차지했으며, 회원 유지율은 92%로 양호한 수준입니다.',
        type: 'monthly',
        category: 'financial',
        status: 'draft',
        createdBy: 'admin-1',
        createdByName: '관리자',
        createdAt: now,
        updatedAt: now,
        metrics: {
          totalRevenue: 25000000,
          expenseTotal: 18000000,
          netProfit: 7000000,
          memberRetentionRate: 92,
          newMemberCount: 45
        },
        period: {
          startDate: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(lastWeek.getFullYear(), lastWeek.getMonth() + 1, 0).toISOString().split('T')[0]
        },
        tags: ['월간보고', '재정', 'KPI']
      }
    ];
  };
  
  // 보고서 및 템플릿 로드
  const [reports, setReports] = useState<Report[]>(() => {
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      return JSON.parse(savedReports);
    }
    return generateSampleReports();
  });
  
  const [templates, setTemplates] = useState<ReportTemplate[]>(() => {
    const savedTemplates = localStorage.getItem('reportTemplates');
    if (savedTemplates) {
      return JSON.parse(savedTemplates);
    }
    return generateSampleTemplates();
  });
  
  const [filteredReports, setFilteredReports] = useState<Report[]>(reports);
  
  // 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('reports', JSON.stringify(reports));
    localStorage.setItem('reportTemplates', JSON.stringify(templates));
    setFilteredReports(reports);
  }, [reports, templates]);
  
  // 보고서 필터링
  const filterReports = (options: ReportFilterOptions) => {
    let filtered = [...reports];
    
    if (options.type && options.type !== 'all') {
      filtered = filtered.filter(report => report.type === options.type);
    }
    
    if (options.category && options.category !== 'all') {
      filtered = filtered.filter(report => report.category === options.category);
    }
    
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(report => report.status === options.status);
    }
    
    if (options.startDate) {
      filtered = filtered.filter(report => 
        report.createdAt >= options.startDate! || 
        (report.period && report.period.startDate >= options.startDate!)
      );
    }
    
    if (options.endDate) {
      filtered = filtered.filter(report => 
        report.createdAt <= options.endDate! || 
        (report.period && report.period.endDate <= options.endDate!)
      );
    }
    
    if (options.createdBy) {
      filtered = filtered.filter(report => report.createdBy === options.createdBy);
    }
    
    if (options.assignedTo) {
      filtered = filtered.filter(report => report.assignedTo === options.assignedTo);
    }
    
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(query) ||
        report.content.toLowerCase().includes(query) ||
        (report.tags && report.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredReports(filtered);
  };
  
  // ID로 보고서 찾기
  const getReportById = (id: string) => {
    return reports.find(report => report.id === id);
  };
  
  // ID로 템플릿 찾기
  const getTemplateById = (id: string) => {
    return templates.find(template => template.id === id);
  };
  
  // 보고서 생성
  const createReport = (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date().toISOString();
    const id = `report-${Date.now()}`;
    
    const newReport: Report = {
      ...reportData,
      id,
      createdAt: now,
      updatedAt: now,
      comments: reportData.comments || [],
      attachments: reportData.attachments || []
    };
    
    setReports(prevReports => [...prevReports, newReport]);
    return id;
  };
  
  // 보고서 업데이트
  const updateReport = (id: string, reportData: Partial<Report>) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === id 
          ? { ...report, ...reportData, updatedAt: new Date().toISOString() } 
          : report
      )
    );
  };
  
  // 보고서 삭제
  const deleteReport = (id: string) => {
    setReports(prevReports => prevReports.filter(report => report.id !== id));
  };
  
  // 보고서 제출
  const submitReport = (id: string) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status: 'submitted', 
              submittedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
  };
  
  // 보고서 검토
  const reviewReport = (id: string, reviewerId: string, reviewerName: string, approved: boolean) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status: approved ? 'approved' : 'rejected', 
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewerId,
              reviewedByName: reviewerName,
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
  };
  
  // 댓글 추가
  const addComment = (reportId: string, commentData: Omit<ReportComment, 'id' | 'reportId' | 'createdAt'>): string => {
    const now = new Date().toISOString();
    const id = `comment-${Date.now()}`;
    
    const newComment: ReportComment = {
      ...commentData,
      id,
      reportId,
      createdAt: now
    };
    
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              comments: [...(report.comments || []), newComment],
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
    
    return id;
  };
  
  // 댓글 삭제
  const deleteComment = (reportId: string, commentId: string) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId && report.comments
          ? { 
              ...report, 
              comments: report.comments.filter(comment => comment.id !== commentId),
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
  };
  
  // 첨부파일 추가
  const addAttachment = (reportId: string, attachmentData: Omit<ReportAttachment, 'id' | 'reportId' | 'uploadedAt'>): string => {
    const now = new Date().toISOString();
    const id = `attachment-${Date.now()}`;
    
    const newAttachment: ReportAttachment = {
      ...attachmentData,
      id,
      reportId,
      uploadedAt: now
    };
    
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              attachments: [...(report.attachments || []), newAttachment],
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
    
    return id;
  };
  
  // 첨부파일 삭제
  const deleteAttachment = (reportId: string, attachmentId: string) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId && report.attachments
          ? { 
              ...report, 
              attachments: report.attachments.filter(attachment => attachment.id !== attachmentId),
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
  };
  
  // 템플릿 생성
  const createTemplate = (templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date().toISOString();
    const id = `template-${Date.now()}`;
    
    const newTemplate: ReportTemplate = {
      ...templateData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
    return id;
  };
  
  // 템플릿 업데이트
  const updateTemplate = (id: string, templateData: Partial<ReportTemplate>) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === id 
          ? { ...template, ...templateData, updatedAt: new Date().toISOString() } 
          : template
      )
    );
  };
  
  // 템플릿 삭제
  const deleteTemplate = (id: string) => {
    setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== id));
  };
  
  // 기간별 보고서 통계
  const getReportStatsByPeriod = (startDate: string, endDate: string) => {
    const filteredByPeriod = reports.filter(report => {
      const createdAt = report.createdAt.split('T')[0];
      return createdAt >= startDate && createdAt <= endDate;
    });
    
    const total = filteredByPeriod.length;
    
    const byStatus: Record<ReportStatus, number> = {
      draft: 0,
      submitted: 0,
      reviewed: 0,
      approved: 0,
      rejected: 0
    };
    
    const byType: Record<ReportType, number> = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      performance: 0,
      incident: 0,
      custom: 0
    };
    
    const byCategory: Record<ReportCategory, number> = {
      trainer: 0,
      facility: 0,
      client: 0,
      financial: 0,
      operational: 0
    };
    
    filteredByPeriod.forEach(report => {
      byStatus[report.status]++;
      byType[report.type]++;
      byCategory[report.category]++;
    });
    
    return {
      total,
      byStatus,
      byType,
      byCategory
    };
  };
  
  // 사용자별 보고서 통계
  const getUserReportStats = (userId: string) => {
    const userReports = reports.filter(report => report.createdBy === userId);
    
    return {
      created: userReports.length,
      submitted: userReports.filter(report => report.status !== 'draft').length,
      approved: userReports.filter(report => report.status === 'approved').length,
      rejected: userReports.filter(report => report.status === 'rejected').length
    };
  };
  
  return (
    <ReportContext.Provider
      value={{
        reports,
        templates,
        filteredReports,
        filterReports,
        createReport,
        updateReport,
        deleteReport,
        getReportById,
        submitReport,
        reviewReport,
        addComment,
        deleteComment,
        addAttachment,
        deleteAttachment,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplateById,
        getReportStatsByPeriod,
        getUserReportStats
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error("useReport must be used within a ReportProvider");
  return context;
}; 