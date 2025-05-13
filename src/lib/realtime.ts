import { supabase } from './supabase';

// 실시간 테이블 변경 구독 타입
export type RealtimePayload<T> = {
  new: T;
  old: T | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

// 실시간 구독 옵션
export interface SubscriptionOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

// 실시간 채널 추적 - 빈 객체로 대체
const activeChannels: Map<string, any> = new Map();

/**
 * Mock 구현 - 실제 Supabase 연동 없이 더미 기능 제공
 */
export function subscribeToTable<T extends Record<string, any>>(
  tableName: string,
  callback: (payload: RealtimePayload<T>) => void,
  options: SubscriptionOptions = { event: '*' }
): () => void {
  const { event = '*', filter } = options;
  const channelId = `${tableName}:${event}:${filter || 'all'}`;
  
  console.log(`Mock 구독: ${channelId} (실제 데이터 변경사항 모니터링 없음)`);
  
  // 더미 채널 객체
  const mockChannel = {
    unsubscribe: () => console.log(`Mock 구독 해제: ${channelId}`)
  };
  
  // 구독 추적
  activeChannels.set(channelId, mockChannel);
  
  // 구독 해제 함수 반환
  return () => unsubscribeFromChannel(channelId);
}

/**
 * 특정 채널 구독 해제
 */
function unsubscribeFromChannel(channelId: string): void {
  const channel = activeChannels.get(channelId);
  if (channel) {
    channel.unsubscribe();
    activeChannels.delete(channelId);
  }
}

/**
 * 모든 실시간 구독 해제
 */
export function unsubscribeAll(): void {
  activeChannels.forEach((channel, id) => {
    channel.unsubscribe();
  });
  activeChannels.clear();
} 