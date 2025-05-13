import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Announcement } from '../types/index';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성을 위해 import

interface AnnouncementContextType {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<void>;
  addAnnouncement: (newAnnouncementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAnnouncement: (updatedAnnouncementData: Partial<Announcement> & { id: string }) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

// 초기 샘플 데이터
const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '시스템 점검 안내',
    content: '시스템 점검으로 인해 일시적으로 서비스 이용이 제한될 수 있습니다.',
    priority: 'high',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    targetAudience: 'all',
    showInBanner: true
  },
  {
    id: '2',
    title: '운영시간 변경 안내',
    content: '4월부터 피트니스 센터 운영시간이 변경됩니다. 자세한 내용은 공지사항을 확인해주세요.',
    priority: 'medium',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPublished: true,
    targetAudience: 'all',
    showInBanner: false
  }
];

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 항상 샘플 데이터 사용
      setAnnouncements(sampleAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      setAnnouncements(sampleAnnouncements);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const addAnnouncement = async (newAnnouncementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const newAnnouncement: Announcement = {
        ...newAnnouncementData,
        id: uuidv4(), // 고유 ID 생성
        createdAt: now,
        updatedAt: now,
        isPublished: newAnnouncementData.isPublished ?? true,
        showInBanner: newAnnouncementData.showInBanner ?? false
      };
      
      // 로컬 상태만 업데이트
      setAnnouncements((prevAnnouncements) => [newAnnouncement, ...prevAnnouncements]);
    } catch (err) {
      console.error('Error adding announcement:', err);
      setError('공지사항 추가 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async (updatedAnnouncementData: Partial<Announcement> & { id: string }) => {
    setLoading(true);
    setError(null);
    try {
      const updates = {
        ...updatedAnnouncementData,
        updatedAt: new Date().toISOString()
      };
      
      // 로컬 상태 업데이트
      setAnnouncements((prevAnnouncements) =>
        prevAnnouncements.map((announcement) =>
          announcement.id === updatedAnnouncementData.id 
            ? { ...announcement, ...updates } 
            : announcement
        )
      );
    } catch (err) {
      console.error('Error updating announcement:', err);
      setError('공지사항 업데이트 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // 로컬 상태 업데이트
      setAnnouncements((prevAnnouncements) => 
        prevAnnouncements.filter((announcement) => announcement.id !== id)
      );
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('공지사항 삭제 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnnouncementContext.Provider value={{ announcements, loading, error, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};