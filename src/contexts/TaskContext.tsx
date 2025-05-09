import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { addDays } from 'date-fns';

// 업무 우선순위
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// 업무 상태
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// 업무 카테고리
export type TaskCategory = 'maintenance' | 'administrative' | 'client' | 'training' | 'general';

// 업무 인터페이스
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // ISO 문자열
  createdAt: string; // ISO 문자열
  updatedAt: string; // ISO 문자열
  assignedTo: string; // 유저 ID
  assignedToName: string; // 유저 이름
  assignedBy: string; // 유저 ID
  assignedByName: string; // 유저 이름
  completedAt?: string; // ISO 문자열
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

// 업무 댓글
export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

// 업무 첨부 파일
export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

// 필터 옵션
interface TaskFilterOptions {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: TaskCategory | 'all';
  assignedTo?: string;
  searchQuery?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filterTasks: (options: TaskFilterOptions) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updatedData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  // 샘플 업무 생성 함수를 먼저 정의
  const generateSampleTasks = (): Task[] => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    const sampleTasks: Task[] = [
      {
        id: 'task-1',
        title: '장비 유지보수: 트레드밀 #3',
        description: '정기 점검 및 벨트 조정이 필요합니다. 소모품 교체도 확인해 주세요.',
        status: 'pending',
        priority: 'high',
        category: 'maintenance',
        dueDate: tomorrow.toISOString(),
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        assignedTo: 'user-1',
        assignedToName: '김철수',
        assignedBy: 'admin-1',
        assignedByName: '관리자',
        comments: [
          {
            id: 'comment-1',
            content: '부품 주문이 필요할 수 있습니다.',
            createdAt: today.toISOString(),
            authorId: 'admin-1',
            authorName: '관리자'
          }
        ]
      },
      {
        id: 'task-2',
        title: '신규 PT 플랜 작성',
        description: '신규 회원을 위한 8주 체중 감량 프로그램을 작성해주세요.',
        status: 'in-progress',
        priority: 'medium',
        category: 'client',
        dueDate: nextWeek.toISOString(),
        createdAt: addDays(today, -2).toISOString(),
        updatedAt: today.toISOString(),
        assignedTo: 'user-2',
        assignedToName: '박지민',
        assignedBy: 'admin-1',
        assignedByName: '관리자'
      },
      {
        id: 'task-3',
        title: '회원 상담: 김영희',
        description: '체중 감량 진행 상황과 식단 계획에 대해 상담해주세요.',
        status: 'completed',
        priority: 'medium',
        category: 'client',
        dueDate: addDays(today, -1).toISOString(),
        createdAt: addDays(today, -3).toISOString(),
        updatedAt: addDays(today, -1).toISOString(),
        completedAt: addDays(today, -1).toISOString(),
        assignedTo: 'user-3',
        assignedToName: '최준호',
        assignedBy: 'admin-1',
        assignedByName: '관리자',
        comments: [
          {
            id: 'comment-2',
            content: '상담 완료했습니다. 현재 2kg 감량 성공했으며, 새로운 식단 계획 전달했습니다.',
            createdAt: addDays(today, -1).toISOString(),
            authorId: 'user-3',
            authorName: '최준호'
          }
        ]
      },
      {
        id: 'task-4',
        title: '월간 보고서 작성',
        description: '4월 회원 등록 현황과 PT 실적을 포함한 월간 보고서를 작성해주세요.',
        status: 'pending',
        priority: 'high',
        category: 'administrative',
        dueDate: addDays(today, 3).toISOString(),
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        assignedTo: 'admin-2',
        assignedToName: '이영희',
        assignedBy: 'admin-1',
        assignedByName: '관리자'
      },
      {
        id: 'task-5',
        title: '신규 트레이너 교육',
        description: '새로 입사한 트레이너에게 시스템 사용법과 업무 프로세스를 교육해주세요.',
        status: 'in-progress',
        priority: 'urgent',
        category: 'training',
        dueDate: tomorrow.toISOString(),
        createdAt: addDays(today, -1).toISOString(),
        updatedAt: today.toISOString(),
        assignedTo: 'user-3',
        assignedToName: '최준호',
        assignedBy: 'admin-1',
        assignedByName: '관리자'
      }
    ];
    
    return sampleTasks;
  };

  // 로컬 스토리지에서 업무 정보 불러오기
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    // 샘플 데이터
    return generateSampleTasks();
  });
  
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  
  // 업무 정보가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    setFilteredTasks(tasks); // 기본적으로 모든 업무를 표시
  }, [tasks]);
  
  // 업무 필터링
  const filterTasks = (options: TaskFilterOptions) => {
    let filtered = [...tasks];
    
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(task => task.status === options.status);
    }
    
    if (options.priority && options.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === options.priority);
    }
    
    if (options.category && options.category !== 'all') {
      filtered = filtered.filter(task => task.category === options.category);
    }
    
    if (options.assignedTo) {
      filtered = filtered.filter(task => task.assignedTo === options.assignedTo);
    }
    
    if (options.dueDateFrom) {
      filtered = filtered.filter(task => new Date(task.dueDate) >= new Date(options.dueDateFrom!));
    }
    
    if (options.dueDateTo) {
      filtered = filtered.filter(task => new Date(task.dueDate) <= new Date(options.dueDateTo!));
    }
    
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.assignedToName.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTasks(filtered);
  };
  
  // 업무 추가
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      comments: [],
      attachments: []
    };
    
    setTasks(prevTasks => [task, ...prevTasks]);
  };
  
  // 업무 수정
  const updateTask = (id: string, updatedData: Partial<Task>) => {
    const now = new Date().toISOString();
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              ...updatedData, 
              updatedAt: now,
              // 상태가 완료로 변경되면 완료 시간 설정
              completedAt: 
                updatedData.status === 'completed' && task.status !== 'completed'
                  ? now
                  : task.completedAt
            } 
          : task
      )
    );
  };
  
  // 업무 삭제
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  // 댓글 추가
  const addComment = (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newComment: TaskComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: now
    };
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              comments: [...(task.comments || []), newComment],
              updatedAt: now
            } 
          : task
      )
    );
  };
  
  // 첨부 파일 추가
  const addAttachment = (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => {
    const newAttachment: TaskAttachment = {
      ...attachment,
      id: `attachment-${Date.now()}`
    };
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              attachments: [...(task.attachments || []), newAttachment],
              updatedAt: new Date().toISOString()
            } 
          : task
      )
    );
  };
  
  // 첨부 파일 삭제
  const deleteAttachment = (taskId: string, attachmentId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              attachments: (task.attachments || []).filter(a => a.id !== attachmentId),
              updatedAt: new Date().toISOString()
            } 
          : task
      )
    );
  };
  
  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        filteredTasks, 
        filterTasks, 
        addTask, 
        updateTask, 
        deleteTask, 
        addComment, 
        addAttachment, 
        deleteAttachment 
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used within a TaskProvider");
  return context;
}; 