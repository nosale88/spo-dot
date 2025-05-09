import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Announcement } from '../types/index';
import { supabase } from '../supabaseClient';

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

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Supabase에서 공지사항 가져오기 시도
      const { data, error: supabaseError } = await supabase
        .from('announcements')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      
      if (data) {
        setAnnouncements(data as Announcement[]);
      } else {
        // 테이블이 없거나 데이터가 없는 경우 기본 데이터 사용
        setAnnouncements([
          {
            id: '1',
            title: '시스템 점검 안내',
            content: '시스템 점검으로 인해 일시적으로 서비스 이용이 제한될 수 있습니다.',
            priority: 'high',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      // 오류 발생 시 기본 데이터 사용
      setAnnouncements([
        {
          id: '1',
          title: '시스템 점검 안내',
          content: '시스템 점검으로 인해 일시적으로 서비스 이용이 제한될 수 있습니다.',
          priority: 'high',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
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
      const newAnnouncement = {
        ...newAnnouncementData,
        createdAt: now,
        updatedAt: now
      };
      
      // Supabase에 공지사항 추가 시도
      const { data, error: supabaseError } = await supabase
        .from('announcements')
        .insert([newAnnouncement])
        .select();
        
      if (supabaseError) throw supabaseError;
      
      if (data && data.length > 0) {
        setAnnouncements((prevAnnouncements) => [...prevAnnouncements, data[0] as Announcement]);
      }
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
      
      setAnnouncements((prevAnnouncements) =>
        prevAnnouncements.map((announcement) =>
          announcement.id === updatedAnnouncementData.id ? { ...announcement, ...updates } : announcement
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
      setAnnouncements((prevAnnouncements) => prevAnnouncements.filter((announcement) => announcement.id !== id));
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