import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, addDays } from 'date-fns';

// 일정 유형
export type SessionType = 'PT' | 'OT' | 'GROUP' | 'CONSULT';

// 반복 유형
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

// 일정 인터페이스
export interface Schedule {
  id: string;
  clientName: string;
  clientId?: string;
  trainerId: string;
  trainerName: string;
  type: SessionType;
  date: string; // 'YYYY-MM-DD' 형식
  startTime: string; // 'HH:MM' 형식
  endTime: string; // 'HH:MM' 형식
  notes?: string;
  recurrence?: RecurrenceType;
  recurrenceEndDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleContextType {
  schedules: Schedule[];
  filteredSchedules: Schedule[];
  filterSchedules: (options: FilterOptions) => void;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  markScheduleComplete: (id: string, isCompleted: boolean) => void;
}

interface FilterOptions {
  date?: string;
  trainerId?: string;
  clientId?: string;
  type?: SessionType;
  searchQuery?: string;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  // 샘플 일정 생성 함수를 먼저 정의
  const generateSampleSchedules = (): Schedule[] => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dayAfterTomorrow = addDays(today, 2);
    
    return [
      {
        id: 'schedule-1',
        clientName: '김영희',
        clientId: 'client-1',
        trainerId: 'trainer-1',
        trainerName: '박지민 트레이너',
        type: 'PT',
        date: format(today, 'yyyy-MM-dd'),
        startTime: '10:00',
        endTime: '11:00',
        notes: '체중 감량 프로그램 3일차',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'schedule-2',
        clientName: '이철수',
        clientId: 'client-2',
        trainerId: 'trainer-1',
        trainerName: '박지민 트레이너',
        type: 'PT',
        date: format(today, 'yyyy-MM-dd'),
        startTime: '14:00',
        endTime: '15:00',
        notes: '근력 강화 훈련',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'schedule-3',
        clientName: '강준호',
        clientId: 'client-3',
        trainerId: 'trainer-2',
        trainerName: '최준호 트레이너',
        type: 'OT',
        date: format(tomorrow, 'yyyy-MM-dd'),
        startTime: '11:00',
        endTime: '12:00',
        notes: '초기 상담 및 신체 측정',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'schedule-4',
        clientName: '그룹 수업 (10명)',
        trainerId: 'trainer-2',
        trainerName: '최준호 트레이너',
        type: 'GROUP',
        date: format(tomorrow, 'yyyy-MM-dd'),
        startTime: '18:00',
        endTime: '19:00',
        notes: '요가 클래스',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'schedule-5',
        clientName: '황미영',
        clientId: 'client-4',
        trainerId: 'trainer-3',
        trainerName: '김지연 트레이너',
        type: 'CONSULT',
        date: format(dayAfterTomorrow, 'yyyy-MM-dd'),
        startTime: '15:00',
        endTime: '16:00',
        notes: '영양 상담',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };
  
  // 로컬 스토리지에서 일정 정보 불러오기
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
      return JSON.parse(savedSchedules);
    }
    // 샘플 데이터
    return generateSampleSchedules();
  });
  
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>(schedules);
  
  // 일정 정보가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
    setFilteredSchedules(schedules); // 기본적으로 모든 일정을 표시
  }, [schedules]);
  
  // 일정 필터링
  const filterSchedules = (options: FilterOptions) => {
    let filtered = [...schedules];
    
    if (options.date) {
      filtered = filtered.filter(schedule => schedule.date === options.date);
    }
    
    if (options.trainerId) {
      filtered = filtered.filter(schedule => schedule.trainerId === options.trainerId);
    }
    
    if (options.clientId) {
      filtered = filtered.filter(schedule => schedule.clientId === options.clientId);
    }
    
    if (options.type) {
      filtered = filtered.filter(schedule => schedule.type === options.type);
    }
    
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.clientName.toLowerCase().includes(query) ||
        schedule.trainerName.toLowerCase().includes(query) ||
        (schedule.notes && schedule.notes.toLowerCase().includes(query))
      );
    }
    
    setFilteredSchedules(filtered);
  };
  
  // 일정 추가
  const addSchedule = (newSchedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => {
    const now = new Date().toISOString();
    const schedule: Schedule = {
      ...newSchedule,
      id: `schedule-${Date.now()}`,
      isCompleted: false,
      createdAt: now,
      updatedAt: now
    };
    
    // 반복 일정 처리
    if (newSchedule.recurrence && newSchedule.recurrence !== 'none' && newSchedule.recurrenceEndDate) {
      const recurrentSchedules = generateRecurrentSchedules(schedule);
      setSchedules(prevSchedules => [...recurrentSchedules, ...prevSchedules]);
    } else {
      setSchedules(prevSchedules => [schedule, ...prevSchedules]);
    }
  };
  
  // 반복 일정 생성
  const generateRecurrentSchedules = (schedule: Schedule): Schedule[] => {
    const schedules: Schedule[] = [];
    
    if (!schedule.recurrence || schedule.recurrence === 'none' || !schedule.recurrenceEndDate) {
      return [schedule];
    }
    
    let currentDate = new Date(schedule.date);
    const endDate = new Date(schedule.recurrenceEndDate);
    
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const now = new Date().toISOString();
      
      schedules.push({
        ...schedule,
        id: `schedule-${Date.now()}-${schedules.length}`,
        date: dateString,
        createdAt: now,
        updatedAt: now
      });
      
      // 반복 패턴에 따라 다음 날짜 계산
      if (schedule.recurrence === 'daily') {
        currentDate = addDays(currentDate, 1);
      } else if (schedule.recurrence === 'weekly') {
        currentDate = addDays(currentDate, 7);
      } else if (schedule.recurrence === 'monthly') {
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }
    }
    
    return schedules;
  };
  
  // 일정 수정
  const updateSchedule = (id: string, updatedData: Partial<Schedule>) => {
    setSchedules(prevSchedules => 
      prevSchedules.map(schedule => 
        schedule.id === id 
          ? { ...schedule, ...updatedData, updatedAt: new Date().toISOString() } 
          : schedule
      )
    );
  };
  
  // 일정 삭제
  const deleteSchedule = (id: string) => {
    setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== id));
  };
  
  // 일정 완료 표시
  const markScheduleComplete = (id: string, isCompleted: boolean) => {
    setSchedules(prevSchedules => 
      prevSchedules.map(schedule => 
        schedule.id === id 
          ? { ...schedule, isCompleted, updatedAt: new Date().toISOString() } 
          : schedule
      )
    );
  };
  
  return (
    <ScheduleContext.Provider 
      value={{ 
        schedules, 
        filteredSchedules, 
        filterSchedules, 
        addSchedule, 
        updateSchedule, 
        deleteSchedule, 
        markScheduleComplete 
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("useSchedule must be used within a ScheduleProvider");
  return context;
}; 