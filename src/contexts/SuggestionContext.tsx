import React, { createContext, useContext, useState, ReactNode } from 'react';
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
}

interface SuggestionContextType {
  suggestions: Suggestion[];
  getSuggestionById: (id: string) => Suggestion | undefined;
  addSuggestion: (title: string, content: string, createdBy: User | null) => void;
  updateSuggestionReply: (suggestionId: string, reply: string, repliedBy: User) => void;
  // deleteSuggestion: (id: string) => void; // Optional: can be added later
}

const SuggestionContext = createContext<SuggestionContextType | undefined>(undefined);

const initialSuggestionsData: Suggestion[] = [
  {
    id: 'sug1',
    title: '체육관 시설 개선 건의',
    content: '러닝머신 중 2대가 고장나 있습니다. 빠른 수리 부탁드립니다.',
    createdBy: { id: 'user123', name: '김민수' },
    createdByName: '김민수',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'pending',
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
    repliedBy: {id: 'admin001', name: '관리자 A'}
  },
  {
    id: 'sug3',
    title: '요가 수업 시간 추가 요청',
    content: '저녁 시간대 요가 수업이 너무 인기가 많아 참여하기 어렵습니다. 추가 개설을 검토해주시면 감사하겠습니다.',
    createdBy: { id: 'user789', name: '박서준' },
    createdByName: '박서준',
    createdAt: new Date().toISOString(),
    status: 'pending',
  },
];

export const SuggestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestionsData);

  const getSuggestionById = (id: string): Suggestion | undefined => {
    return suggestions.find(suggestion => suggestion.id === id);
  };

  const addSuggestion = (title: string, content: string, createdBy: User | null) => {
    const newSuggestion: Suggestion = {
      id: uuidv4(),
      title,
      content,
      createdBy,
      createdByName: createdBy ? createdBy.name : '익명 사용자',
      createdAt: new Date().toISOString(),
      status: 'pending',
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
              status: 'answered' 
            }
          : suggestion
      )
    );
  };

  return (
    <SuggestionContext.Provider value={{ suggestions, getSuggestionById, addSuggestion, updateSuggestionReply }}>
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
