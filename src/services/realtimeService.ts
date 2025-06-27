import { supabase } from '../lib/supabase';
import { RealtimeChannel, REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import { showSuccess, showError, showInfo, showWarning, logger } from '../utils/notifications';

// 실시간 이벤트 타입
export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  table: string;
  schema: string;
  commit_timestamp: string;
}

// 실시간 구독 콜백 타입
export type RealtimeCallback<T = any> = (event: RealtimeEvent<T>) => void;

// 실시간 알림 페이로드
export interface RealtimeNotificationPayload {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// 실시간 서비스 클래스
export class RealtimeService {
  private static instance: RealtimeService;
  private channels = new Map<string, RealtimeChannel>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // 연결 상태 확인
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 실시간 알림 구독 (사용자별)
  subscribeToUserNotifications(
    userId: string,
    onNotification: (notification: RealtimeNotificationPayload) => void
  ): () => void {
    const channelName = `user_notifications_${userId}`;
    
    // 기존 채널이 있으면 안전하게 해제
    if (this.channels.has(channelName)) {
      this.unsubscribeChannel(channelName);
    }

    try {
      logger.info(`사용자 알림 구독 시작: ${userId}`);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            logger.info('실시간 알림 수신:', payload);
            
            if (payload.eventType === 'INSERT' && payload.new) {
              const notification: RealtimeNotificationPayload = {
                id: payload.new.id,
                user_id: payload.new.user_id,
                type: payload.new.type,
                title: payload.new.title,
                message: payload.new.message,
                link: payload.new.link,
                is_read: payload.new.is_read,
                created_at: payload.new.created_at,
                metadata: payload.new.metadata
              };

              // 콜백 호출
              onNotification(notification);
              
              // 토스트 알림 표시
              this.showNotificationToast(notification);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.reconnectAttempts = 0; // 성공 시 재연결 횟수 리셋
            logger.info(`사용자 알림 구독 성공: ${userId}`);
          } else if (status === 'CLOSED') {
            this.isConnected = false;
            logger.warn(`사용자 알림 연결 종료: ${userId}`);
            // 재연결 시도
            this.handleReconnect(channelName, () => 
              this.subscribeToUserNotifications(userId, onNotification)
            );
          } else if (status === 'CHANNEL_ERROR') {
            this.isConnected = false;
            logger.error(`사용자 알림 채널 오류: ${userId}`);
            // 재연결 시도
            this.handleReconnect(channelName, () => 
              this.subscribeToUserNotifications(userId, onNotification)
            );
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribeChannel(channelName);
    } catch (error) {
      logger.error('사용자 알림 구독 중 오류:', error);
      return () => {};
    }
  }

  // 실시간 작업 변경 구독
  subscribeToTaskChanges(
    userId: string,
    onTaskChange: RealtimeCallback
  ): () => void {
    const channelName = `task_changes_${userId}`;
    
    // 기존 채널이 있으면 안전하게 해제
    if (this.channels.has(channelName)) {
      this.unsubscribeChannel(channelName);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `assigned_to=eq.${userId}`
          },
          (payload) => {
            logger.info('작업 변경 감지:', payload);
            onTaskChange(payload as RealtimeEvent);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info(`작업 변경 구독 성공: ${userId}`);
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribeChannel(channelName);
    } catch (error) {
      logger.error('작업 변경 구독 중 오류:', error);
      return () => {};
    }
  }

  // 실시간 공지사항 구독
  subscribeToAnnouncements(
    onAnnouncementChange: RealtimeCallback
  ): () => void {
    const channelName = 'announcements_global';
    
    // 기존 채널이 있으면 안전하게 해제
    if (this.channels.has(channelName)) {
      this.unsubscribeChannel(channelName);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'announcements'
          },
          (payload) => {
            logger.info('공지사항 변경 감지:', payload);
            onAnnouncementChange(payload as RealtimeEvent);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info('공지사항 구독 성공');
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribeChannel(channelName);
    } catch (error) {
      logger.error('공지사항 구독 중 오류:', error);
      return () => {};
    }
  }

  // 실시간 일정 변경 구독
  subscribeToScheduleChanges(
    userId: string,
    onScheduleChange: RealtimeCallback
  ): () => void {
    const channelName = `schedule_changes_${userId}`;
    
    // 기존 채널이 있으면 안전하게 해제
    if (this.channels.has(channelName)) {
      this.unsubscribeChannel(channelName);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'schedules'
          },
          (payload) => {
            logger.info('일정 변경 감지:', payload);
            onScheduleChange(payload as RealtimeEvent);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info(`일정 변경 구독 성공: ${userId}`);
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribeChannel(channelName);
    } catch (error) {
      logger.error('일정 변경 구독 중 오류:', error);
      return () => {};
    }
  }

  // 브로드캐스트 메시지 구독 (채팅, 실시간 메시지)
  subscribeToBroadcast(
    channelName: string,
    eventName: string,
    onMessage: (payload: any) => void
  ): () => void {
    // 기존 채널이 있으면 안전하게 해제
    if (this.channels.has(channelName)) {
      this.unsubscribeChannel(channelName);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on('broadcast', { event: eventName }, (payload) => {
          logger.info(`브로드캐스트 메시지 수신 [${eventName}]:`, payload);
          onMessage(payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info(`브로드캐스트 구독 성공: ${channelName}/${eventName}`);
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribeChannel(channelName);
    } catch (error) {
      logger.error('브로드캐스트 구독 중 오류:', error);
      return () => {};
    }
  }

  // 브로드캐스트 메시지 전송
  async sendBroadcastMessage(
    channelName: string,
    eventName: string,
    payload: any
  ): Promise<void> {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: eventName,
          payload
        });
        logger.info(`브로드캐스트 메시지 전송: ${channelName}/${eventName}`);
      } else {
        logger.error(`채널을 찾을 수 없음: ${channelName}`);
      }
    } catch (error) {
      logger.error('브로드캐스트 메시지 전송 실패:', error);
    }
  }

  // 온라인 사용자 추적
  subscribeToPresence(
    channelName: string,
    userId: string,
    userInfo: { name: string; role: string; avatar?: string },
    onPresenceChange: (presences: Record<string, any>) => void
  ): () => void {
    // 기존 채널이 있으면 안전하게 해제
    if (this.channels.has(channelName)) {
      this.unsubscribeChannel(channelName);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          logger.info('온라인 사용자 동기화:', newState);
          onPresenceChange(newState);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          logger.info('사용자 접속:', { key, newPresences });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          logger.info('사용자 퇴장:', { key, leftPresences });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // 현재 사용자를 온라인으로 표시
            await channel.track({
              user_id: userId,
              ...userInfo,
              online_at: new Date().toISOString()
            });
            logger.info(`프레즌스 구독 성공: ${channelName}`);
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribeChannel(channelName);
    } catch (error) {
      logger.error('프레즌스 구독 중 오류:', error);
      return () => {};
    }
  }

  // 알림 토스트 표시
  private showNotificationToast(notification: RealtimeNotificationPayload): void {
    switch (notification.type) {
      case 'success':
        showSuccess(`${notification.title}: ${notification.message}`);
        break;
      case 'error':
        showError(`${notification.title}: ${notification.message}`);
        break;
      case 'warning':
        showWarning(`${notification.title}: ${notification.message}`);
        break;
      default:
        showInfo(`${notification.title}: ${notification.message}`);
        break;
    }
  }

  // 재연결 처리 - 안전한 방식으로 수정
  private handleReconnect(channelName: string, resubscribeFunc: () => void): void {
    // 이미 재연결 중인 경우 중복 실행 방지
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`최대 재연결 시도 횟수 초과: ${channelName}`);
      showError('연결 오류: 실시간 알림 연결에 실패했습니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // 최대 30초
    
    logger.info(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후) - ${channelName}`);
    
    // setTimeout 대신 Promise 기반으로 처리
    Promise.resolve().then(() => {
      return new Promise(resolve => setTimeout(resolve, delay));
    }).then(() => {
      try {
        // 기존 채널이 있으면 먼저 정리
        if (this.channels.has(channelName)) {
          this.unsubscribeChannel(channelName);
        }
        
        // 재구독 실행
        resubscribeFunc();
      } catch (error) {
        logger.error(`재연결 중 오류 [${channelName}]:`, error);
      }
    }).catch(error => {
      logger.error(`재연결 Promise 오류 [${channelName}]:`, error);
    });
  }

  // 채널 구독 해제 - 안전한 방식으로 수정
  private unsubscribeChannel(channelName: string): void {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        logger.info(`채널 구독 해제 시도: ${channelName}`);
        
        // 채널을 먼저 Map에서 제거하여 재귀 방지
        this.channels.delete(channelName);
        
        // Promise 기반 작업을 안전하게 처리
        Promise.resolve().then(() => {
          try {
            supabase.removeChannel(channel);
            logger.info(`채널 구독 해제 완료: ${channelName}`);
          } catch (removeError) {
            logger.error(`Supabase 채널 제거 중 오류 [${channelName}]:`, removeError);
          }
        }).catch(error => {
          logger.error(`채널 제거 Promise 오류 [${channelName}]:`, error);
        });
      }
    } catch (error) {
      logger.error(`채널 구독 해제 중 오류 [${channelName}]:`, error);
      // 에러가 발생해도 Map에서는 제거
      this.channels.delete(channelName);
    }
  }

  // 모든 구독 해제 - 안전한 방식으로 수정
  unsubscribeAll(): void {
    logger.info('모든 실시간 구독 해제 시작');
    
    // 채널 이름들을 미리 복사하여 iteration 중 modification 방지
    const channelNames = Array.from(this.channels.keys());
    
    channelNames.forEach((channelName) => {
      this.unsubscribeChannel(channelName);
    });
    
    // 안전을 위해 명시적으로 clear
    this.channels.clear();
    this.isConnected = false;
    logger.info('모든 실시간 구독 해제 완료');
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      // 간단한 heartbeat 채널로 연결 상태 확인
      const testChannel = supabase.channel('connection_test');
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          supabase.removeChannel(testChannel);
          resolve(false);
        }, 5000);

        testChannel.subscribe((status) => {
          clearTimeout(timeout);
          const isConnected = status === 'SUBSCRIBED';
          supabase.removeChannel(testChannel);
          resolve(isConnected);
        });
      });
    } catch (error) {
      logger.error('연결 상태 확인 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 export
export const realtimeService = RealtimeService.getInstance(); 