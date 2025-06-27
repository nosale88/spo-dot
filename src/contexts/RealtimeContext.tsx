import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { realtimeService, RealtimeNotificationPayload } from '../services/realtimeService';
import { logger } from '../utils/notifications';

// 온라인 사용자 정보
export interface OnlineUser {
  user_id: string;
  name: string;
  role: string;
  avatar?: string;
  online_at: string;
}

// 실시간 컨텍스트 타입
interface RealtimeContextType {
  // 연결 상태
  isConnected: boolean;
  
  // 온라인 사용자 목록
  onlineUsers: Record<string, OnlineUser[]>;
  
  // 실시간 알림 수신 콜백 등록
  subscribeToNotifications: (callback: (notification: RealtimeNotificationPayload) => void) => () => void;
  
  // 브로드캐스트 메시지 전송
  sendMessage: (channelName: string, eventName: string, payload: any) => Promise<void>;
  
  // 채팅 채널 구독
  subscribeToChatChannel: (channelName: string, onMessage: (message: any) => void) => () => void;
  
  // 연결 상태 새로고침
  refreshConnection: () => Promise<void>;
}

// 컨텍스트 생성
const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// 실시간 Provider 컴포넌트
export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser[]>>({});
  
  // 실시간 알림 구독 상태
  const [notificationCallbacks] = useState<Set<(notification: RealtimeNotificationPayload) => void>>(new Set());
  
  // 구독 해제 함수들 저장
  const [unsubscribeFunctions] = useState<Set<() => void>>(new Set());

  // 사용자 인증 상태에 따른 실시간 연결 관리
  useEffect(() => {
    if (user?.id) {
      initializeRealtimeConnections();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [user?.id]);

  // 실시간 연결 초기화
  const initializeRealtimeConnections = async () => {
    if (!user?.id) return;

    try {
      logger.info('실시간 연결 초기화 시작');

      // 1. 사용자별 알림 구독
      const unsubscribeNotifications = realtimeService.subscribeToUserNotifications(
        user.id,
        (notification) => {
          logger.info('실시간 알림 수신:', notification);
          // 등록된 모든 콜백 함수 호출
          notificationCallbacks.forEach(callback => callback(notification));
        }
      );
      unsubscribeFunctions.add(unsubscribeNotifications);

      // 2. 작업 변경 구독
      const unsubscribeTasks = realtimeService.subscribeToTaskChanges(
        user.id,
        (event) => {
          logger.info('작업 변경 감지:', event);
          // 필요시 작업 목록 새로고침 등의 처리
        }
      );
      unsubscribeFunctions.add(unsubscribeTasks);

      // 3. 공지사항 구독
      const unsubscribeAnnouncements = realtimeService.subscribeToAnnouncements(
        (event) => {
          logger.info('공지사항 변경 감지:', event);
          // 필요시 공지사항 목록 새로고침 등의 처리
        }
      );
      unsubscribeFunctions.add(unsubscribeAnnouncements);

      // 4. 일정 변경 구독
      const unsubscribeSchedule = realtimeService.subscribeToScheduleChanges(
        user.id,
        (event) => {
          logger.info('일정 변경 감지:', event);
          // 필요시 일정 목록 새로고침 등의 처리
        }
      );
      unsubscribeFunctions.add(unsubscribeSchedule);

      // 5. 온라인 사용자 추적 (전체 워크스페이스)
      const unsubscribePresence = realtimeService.subscribeToPresence(
        'workspace_presence',
        user.id,
        {
          name: user.name || user.email || '사용자',
          role: user.role || 'member',
          avatar: user.avatar
        },
        (presences) => {
          setOnlineUsers(presences);
        }
      );
      unsubscribeFunctions.add(unsubscribePresence);

      // 연결 상태 확인
      const connectionStatus = await realtimeService.checkConnection();
      setIsConnected(connectionStatus);

      logger.info('실시간 연결 초기화 완료');
    } catch (error) {
      logger.error('실시간 연결 초기화 실패:', error);
      setIsConnected(false);
    }
  };

  // 정리 함수
  const cleanup = () => {
    unsubscribeFunctions.forEach(unsub => unsub());
    unsubscribeFunctions.clear();
    notificationCallbacks.clear();
    setIsConnected(false);
    setOnlineUsers({});
    logger.info('실시간 연결 정리 완료');
  };

  // 실시간 알림 콜백 등록
  const subscribeToNotifications = (callback: (notification: RealtimeNotificationPayload) => void) => {
    notificationCallbacks.add(callback);
    
    // 구독 해제 함수 반환
    return () => {
      notificationCallbacks.delete(callback);
    };
  };

  // 브로드캐스트 메시지 전송
  const sendMessage = async (channelName: string, eventName: string, payload: any) => {
    await realtimeService.sendBroadcastMessage(channelName, eventName, payload);
  };

  // 채팅 채널 구독
  const subscribeToChatChannel = (channelName: string, onMessage: (message: any) => void) => {
    const unsubscribe = realtimeService.subscribeToBroadcast(
      channelName,
      'message',
      onMessage
    );
    
    unsubscribeFunctions.add(unsubscribe);
    return unsubscribe;
  };

  // 연결 상태 새로고침
  const refreshConnection = async () => {
    const connectionStatus = await realtimeService.checkConnection();
    setIsConnected(connectionStatus);
    
    if (!connectionStatus && user?.id) {
      // 연결이 끊어진 경우 재연결 시도
      cleanup();
      setTimeout(() => {
        initializeRealtimeConnections();
      }, 1000);
    }
  };

  // 주기적 연결 상태 확인 (30초마다)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user?.id) {
        await refreshConnection();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const value: RealtimeContextType = {
    isConnected,
    onlineUsers,
    subscribeToNotifications,
    sendMessage,
    subscribeToChatChannel,
    refreshConnection
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// 커스텀 훅
export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

// 개발자용 실시간 상태 디버깅 훅
export const useRealtimeDebug = () => {
  const { isConnected, onlineUsers } = useRealtime();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.info('실시간 연결 상태:', isConnected);
      logger.info('온라인 사용자 수:', Object.keys(onlineUsers).length);
    }
  }, [isConnected, onlineUsers]);

  return {
    isConnected,
    onlineUsersCount: Object.keys(onlineUsers).length,
    connectionStatus: isConnected ? '연결됨' : '연결 안됨'
  };
}; 