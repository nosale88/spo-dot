import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Type Definitions
export interface User {
  id: string;
  name: string;
  // email?: string; // Optional email
  // role?: 'user' | 'admin'; // Optional role
}

export type SuggestionStatus = 'pending' | 'answered' | 'rejected';

export interface Suggestion {
  id: string;
  title: string;
  content: string;
  createdBy: User | null; // null for anonymous
  createdByName?: string; // Display name, can be '익명 사용자' or User's name
  createdAt: string;
  status: SuggestionStatus;
  reply?: string;
  repliedAt?: string;
  repliedBy?: User | null;
  category?: string;
  type?: 'staff' | 'customer';
}

// 임시저장 데이터 타입
export interface DraftSuggestion {
  title: string;
  content: string;
  type: 'staff' | 'customer';
  category?: string;
  lastSaved: string;
}

interface SuggestionContextType {
  suggestions: Suggestion[];
  draftSuggestion: DraftSuggestion | null;
  getSuggestionById: (id: string) => Suggestion | undefined;
  addSuggestion: (title: string, content: string, createdBy: User | null, type?: 'staff' | 'customer', category?: string) => void;
  updateSuggestionReply: (suggestionId: string, reply: string, repliedBy: User) => void;
  saveDraft: (draft: DraftSuggestion) => void;
  clearDraft: () => void;
  loadDraft: () => DraftSuggestion | null;
  getUserSuggestions: (userId: string) => Suggestion[];
  // deleteSuggestion: (id: string) => void; // Optional: can be added later
}

const SuggestionContext = createContext<SuggestionContextType | undefined>(undefined);

const STORAGE_KEY = 'fitness_suggestions';
const DRAFT_STORAGE_KEY = 'fitness_suggestion_draft';

const initialSuggestionsData: Suggestion[] = [
  {
    id: 'sug1',
    title: '체육관 시설 개선 건의',
    content: '러닝머신 중 2대가 고장나 있습니다. 빠른 수리 부탁드립니다.',
    createdBy: { id: 'user123', name: '김민수' },
    createdByName: '김민수',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'pending',
    type: 'staff',
    category: '시설'
  },
  {
    id: 'sug2',
    title: '샤워실 온수 문제',
    content: '아침 시간에 샤워실 온수가 잘 나오지 않습니다. 개선해주세요.',
    createdBy: null, // Anonymous example
    createdByName: '익명 사용자',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: 'answered',
    reply: '확인 결과 보일러 설정에 문제가 있었습니다. 현재는 정상적으로 온수가 공급됩니다. 이용에 불편을 드려 죄송합니다.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    repliedBy: {id: 'admin001', name: '관리자 A'},
    type: 'customer',
    category: '시설'
  },
  {
    id: 'sug3',
    title: '요가 수업 시간 추가 요청',
    content: '저녁 시간대 요가 수업이 너무 인기가 많아 참여하기 어렵습니다. 추가 개설을 검토해주시면 감사하겠습니다.',
    createdBy: { id: 'user789', name: '박서준' },
    createdByName: '박서준',
    createdAt: new Date().toISOString(),
    status: 'pending',
    type: 'customer',
    category: '서비스'
  },
  {
    id: 'sug4',
    title: '회의실 예약 시스템 개선 요청',
    content: '현재 회의실 예약 시스템이 불편합니다. 모바일에서도 쉽게 예약할 수 있도록 개선해주세요.',
    createdBy: { id: 'user456', name: '이직원' },
    createdByName: '이직원',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: 'answered',
    reply: '모바일 앱 업데이트를 통해 회의실 예약 기능을 개선했습니다. 새 버전을 다운로드해주세요.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    repliedBy: {id: 'admin002', name: '관리자 B'},
    type: 'staff',
    category: '업무개선'
  }
];

export const SuggestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [draftSuggestion, setDraftSuggestion] = useState<DraftSuggestion | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const savedSuggestions = localStorage.getItem(STORAGE_KEY);
    if (savedSuggestions) {
      try {
        setSuggestions(JSON.parse(savedSuggestions));
      } catch (error) {
        console.error('Failed to load suggestions from localStorage:', error);
        setSuggestions(initialSuggestionsData);
      }
    } else {
      setSuggestions(initialSuggestionsData);
    }

    // 임시저장 데이터 로드
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        setDraftSuggestion(JSON.parse(savedDraft));
      } catch (error) {
        console.error('Failed to load draft from localStorage:', error);
      }
    }
  }, []);

  // 건의사항 변경 시 localStorage에 저장
  useEffect(() => {
    if (suggestions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
    }
  }, [suggestions]);

  const getSuggestionById = (id: string): Suggestion | undefined => {
    return suggestions.find(suggestion => suggestion.id === id);
  };

  const addSuggestion = (
    title: string, 
    content: string, 
    createdBy: User | null, 
    type: 'staff' | 'customer' = 'staff',
    category: string = '기타'
  ) => {
    const newSuggestion: Suggestion = {
      id: uuidv4(),
      title,
      content,
      createdBy,
      createdByName: createdBy ? createdBy.name : '익명 사용자',
      createdAt: new Date().toISOString(),
      status: 'pending',
      type,
      category
    };
    setSuggestions(prevSuggestions => [newSuggestion, ...prevSuggestions]);
  };

  const updateSuggestionReply = (suggestionId: string, reply: string, repliedBy: User) => {
    setSuggestions(prevSuggestions =>
      prevSuggestions.map(suggestion =>
        suggestion.id === suggestionId
          ? { 
              ...suggestion, 
              reply, 
              repliedAt: new Date().toISOString(), 
              repliedBy, 
              status: 'answered' as SuggestionStatus
            }
          : suggestion
      )
    );
  };

  const saveDraft = (draft: DraftSuggestion) => {
    const draftWithTimestamp = {
      ...draft,
      lastSaved: new Date().toISOString()
    };
    setDraftSuggestion(draftWithTimestamp);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftWithTimestamp));
  };

  const clearDraft = () => {
    setDraftSuggestion(null);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const loadDraft = (): DraftSuggestion | null => {
    return draftSuggestion;
  };

  const getUserSuggestions = (userId: string): Suggestion[] => {
    return suggestions.filter(suggestion => 
      suggestion.createdBy?.id === userId
    );
  };

  return (
    <SuggestionContext.Provider value={{ 
      suggestions, 
      draftSuggestion,
      getSuggestionById, 
      addSuggestion, 
      updateSuggestionReply,
      saveDraft,
      clearDraft,
      loadDraft,
      getUserSuggestions
    }}>
      {children}
    </SuggestionContext.Provider>
  );
};

export const useSuggestion = (): SuggestionContextType => {
  const context = useContext(SuggestionContext);
  if (context === undefined) {
    throw new Error('useSuggestion must be used within a SuggestionProvider');
  }
  return context;
};
