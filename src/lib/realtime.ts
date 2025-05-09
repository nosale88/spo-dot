import { RealtimeChannel, RealtimeChannelSnapshot } from '@supabase/supabase-js';
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

// 실시간 채널 추적
const activeChannels: Map<string, RealtimeChannel> = new Map();

/**
 * Supabase 테이블 변경사항 구독
 */
export function subscribeToTable<T extends Record<string, any>>(
  tableName: string,
  callback: (payload: RealtimePayload<T>) => void,
  options: SubscriptionOptions = { event: '*' }
): () => void {
  const { event = '*', filter } = options;
  
  // 채널 ID 생성
  const channelId = `${tableName}:${event}:${filter || 'all'}`;
  
  // 이미 존재하는 채널이면 재사용
  if (activeChannels.has(channelId)) {
    console.log(`이미 구독 중인 채널 재사용: ${channelId}`);
    return () => unsubscribeFromChannel(channelId);
  }
  
  // 새 채널 생성
  const channel = supabase.channel(channelId);
  
  // 테이블 변경사항 구독 설정
  channel
    .on(
      'postgres_changes',
      {
        event: event,
        schema: 'public',
        table: tableName,
        ...(filter && { filter }),
      },
      (payload) => {
        callback({
          new: payload.new as T,
          old: payload.old as T | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        });
      }
    )
    .subscribe((status: RealtimeChannelSnapshot) => {
      console.log(`Subscription status for ${channelId}:`, status);
    });
  
  // 활성 채널 추적
  activeChannels.set(channelId, channel);
  
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
    console.log(`Channel unsubscribed: ${channelId}`);
  }
}

/**
 * 모든 실시간 구독 해제
 */
export function unsubscribeAll(): void {
  activeChannels.forEach((channel, id) => {
    channel.unsubscribe();
    console.log(`Channel unsubscribed: ${id}`);
  });
  activeChannels.clear();
} 