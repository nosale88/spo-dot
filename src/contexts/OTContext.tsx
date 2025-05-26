import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OTMember {
  id: number;
  name: string;
  phone: string;
  email?: string;
  registeredAt: string;
  status: 'pending' | 'assigned' | 'completed';
  preferredDays?: string[];
  preferredTimes?: string[];
  notes?: string;
  otCount: number;
  totalSessions?: number;
  assignedStaffId?: string;
}

export interface OTProgress {
  memberId: number;
  staffId: number;
  totalSessions: number;
  completedSessions: number;
  contactMade: boolean;
  contactDate?: string;
  contactNotes?: string;
  sessions: {
    id: string;
    date: string;
    time: string;
    completed: boolean;
    notes?: string;
  }[];
}

interface OTContextType {
  otMembers: OTMember[];
  otProgress: { [key: string]: OTProgress };
  addOTMember: (member: Omit<OTMember, 'id' | 'registeredAt'>) => void;
  updateOTMember: (id: number, updates: Partial<OTMember>) => void;
  deleteOTMember: (id: number) => void;
  updateProgress: (progressKey: string, updates: Partial<OTProgress>) => void;
  addSession: (progressKey: string, session: Omit<OTProgress['sessions'][0], 'id'>) => void;
  updateSession: (progressKey: string, sessionId: string, updates: Partial<OTProgress['sessions'][0]>) => void;
}

const OTContext = createContext<OTContextType | undefined>(undefined);

// 초기 데이터
const INITIAL_OT_MEMBERS: OTMember[] = [
  { 
    id: 1, 
    name: '김철수', 
    phone: '010-1111-2222',
    email: 'kim@example.com',
    registeredAt: '2024-01-15', 
    status: 'pending',
    preferredDays: ['월요일', '수요일', '금요일'],
    preferredTimes: ['오후 2시-4시'],
    notes: '무릎 부상 있음, 강도 조절 필요',
    otCount: 8,
    totalSessions: 8
  },
  { 
    id: 2, 
    name: '박지민', 
    phone: '010-3333-4444',
    email: 'park@example.com',
    registeredAt: '2024-01-20', 
    status: 'assigned',
    preferredDays: ['화요일', '목요일'],
    preferredTimes: ['저녁 7시-9시'],
    notes: '직장인, 저녁 시간대만 가능',
    otCount: 8,
    totalSessions: 8,
    assignedStaffId: '1'
  },
  { 
    id: 3, 
    name: '이영희', 
    phone: '010-5555-6666',
    email: 'lee@example.com',
    registeredAt: '2024-01-25', 
    status: 'pending',
    preferredDays: ['평일'],
    preferredTimes: ['오전 10시-12시'],
    notes: '주부, 오전 시간대 선호',
    otCount: 12,
    totalSessions: 12
  },
  { 
    id: 4, 
    name: '정우성', 
    phone: '010-7777-8888',
    email: 'jung@example.com',
    registeredAt: '2024-02-01', 
    status: 'completed',
    preferredDays: ['주말'],
    preferredTimes: ['오후 1시-3시'],
    notes: '주말만 가능',
    otCount: 12,
    totalSessions: 12,
    assignedStaffId: '2'
  },
  { 
    id: 5, 
    name: '김지연', 
    phone: '010-9999-0000',
    email: 'kimj@example.com',
    registeredAt: '2024-02-05', 
    status: 'pending',
    preferredDays: ['목요일', '토요일'],
    preferredTimes: ['저녁 6시-8시'],
    notes: '학생, 저녁 시간대 선호',
    otCount: 6,
    totalSessions: 6
  },
];



const INITIAL_PROGRESS: { [key: string]: OTProgress } = {
  '2-1': {
    memberId: 2,
    staffId: 1,
    totalSessions: 8,
    completedSessions: 3,
    contactMade: true,
    contactDate: '2024-01-21',
    contactNotes: '첫 상담 완료, 화목 저녁 시간으로 일정 확정',
    sessions: [
      { id: '1', date: '2024-01-23', time: '19:00', completed: true, notes: '기초 체력 측정' },
      { id: '2', date: '2024-01-25', time: '19:00', completed: true, notes: '상체 운동 위주' },
      { id: '3', date: '2024-01-30', time: '19:00', completed: true, notes: '하체 운동 진행' },
      { id: '4', date: '2024-02-01', time: '19:00', completed: false },
      { id: '5', date: '2024-02-06', time: '19:00', completed: false },
    ]
  },
  '4-2': {
    memberId: 4,
    staffId: 2,
    totalSessions: 12,
    completedSessions: 12,
    contactMade: true,
    contactDate: '2024-02-02',
    contactNotes: '주말 오후 시간으로 일정 조율 완료',
    sessions: []
  }
};

export const OTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [otMembers, setOtMembers] = useState<OTMember[]>(INITIAL_OT_MEMBERS);
  const [otProgress, setOtProgress] = useState<{ [key: string]: OTProgress }>(INITIAL_PROGRESS);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedMembers = localStorage.getItem('otMembers');
    const savedProgress = localStorage.getItem('otProgress');

    if (savedMembers) {
      setOtMembers(JSON.parse(savedMembers));
    }
    if (savedProgress) {
      setOtProgress(JSON.parse(savedProgress));
    }
  }, []);

  // 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('otMembers', JSON.stringify(otMembers));
  }, [otMembers]);

  useEffect(() => {
    localStorage.setItem('otProgress', JSON.stringify(otProgress));
  }, [otProgress]);

  const addOTMember = (memberData: Omit<OTMember, 'id' | 'registeredAt'>) => {
    const newId = Math.max(...otMembers.map(m => m.id), 0) + 1;
    const newMember: OTMember = {
      ...memberData,
      id: newId,
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setOtMembers(prev => [...prev, newMember]);
  };

  const updateOTMember = (id: number, updates: Partial<OTMember>) => {
    setOtMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const deleteOTMember = (id: number) => {
    setOtMembers(prev => prev.filter(member => member.id !== id));
    // 관련 진행 상황도 삭제
    setOtProgress(prev => {
      const newProgress = { ...prev };
      Object.keys(newProgress).forEach(key => {
        if (key.startsWith(`${id}-`)) {
          delete newProgress[key];
        }
      });
      return newProgress;
    });
  };



  const updateProgress = (progressKey: string, updates: Partial<OTProgress>) => {
    setOtProgress(prev => ({
      ...prev,
      [progressKey]: {
        ...prev[progressKey],
        ...updates
      }
    }));
  };

  const addSession = (progressKey: string, sessionData: Omit<OTProgress['sessions'][0], 'id'>) => {
    const newSession = {
      ...sessionData,
      id: Date.now().toString()
    };

    setOtProgress(prev => ({
      ...prev,
      [progressKey]: {
        ...prev[progressKey],
        sessions: [...(prev[progressKey]?.sessions || []), newSession]
      }
    }));
  };

  const updateSession = (progressKey: string, sessionId: string, updates: Partial<OTProgress['sessions'][0]>) => {
    setOtProgress(prev => ({
      ...prev,
      [progressKey]: {
        ...prev[progressKey],
        sessions: prev[progressKey]?.sessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        ) || []
      }
    }));

    // 완료 상태 변경 시 전체 완료 세션 수 업데이트
    if ('completed' in updates) {
      const progress = otProgress[progressKey];
      if (progress) {
        const completedCount = progress.sessions.filter(s => 
          s.id === sessionId ? updates.completed : s.completed
        ).length;
        
        setOtProgress(prev => ({
          ...prev,
          [progressKey]: {
            ...prev[progressKey],
            completedSessions: completedCount
          }
        }));
      }
    }
  };

  const value: OTContextType = {
    otMembers,
    otProgress,
    addOTMember,
    updateOTMember,
    deleteOTMember,
    updateProgress,
    addSession,
    updateSession
  };

  return (
    <OTContext.Provider value={value}>
      {children}
    </OTContext.Provider>
  );
};

export const useOT = () => {
  const context = useContext(OTContext);
  if (context === undefined) {
    throw new Error('useOT must be used within an OTProvider');
  }
  return context;
}; 