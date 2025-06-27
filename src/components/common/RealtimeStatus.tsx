import React, { useState } from 'react';
import { Wifi, WifiOff, Users, Circle, RefreshCw } from 'lucide-react';
import { useRealtime, OnlineUser } from '../../contexts/RealtimeContext';
import { motion, AnimatePresence } from 'framer-motion';

// 연결 상태 인디케이터 컴포넌트
export const ConnectionIndicator: React.FC = () => {
  const { isConnected, refreshConnection } = useRealtime();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshConnection();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-xs font-medium ${
          isConnected ? 'text-green-600' : 'text-red-600'
        }`}>
          {isConnected ? '실시간 연결됨' : '연결 끊김'}
        </span>
      </div>
      
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-1 rounded-full hover:bg-slate-100 transition-colors"
        title="연결 상태 새로고침"
      >
        <RefreshCw className={`h-3 w-3 text-slate-400 ${
          isRefreshing ? 'animate-spin' : ''
        }`} />
      </button>
    </div>
  );
};

// 온라인 사용자 목록 컴포넌트
export const OnlineUsers: React.FC = () => {
  const { onlineUsers } = useRealtime();
  const [isExpanded, setIsExpanded] = useState(false);

  // 모든 온라인 사용자를 플랫 배열로 변환
  const allOnlineUsers = Object.values(onlineUsers).flat();
  const onlineCount = allOnlineUsers.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Users className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">
          온라인 {onlineCount}명
        </span>
        <div className="flex space-x-1">
          {allOnlineUsers.slice(0, 3).map((user, index) => (
            <div
              key={user.user_id}
              className="relative"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full border border-white"></div>
            </div>
          ))}
          {onlineCount > 3 && (
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
              +{onlineCount - 3}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-200">
              <h3 className="font-medium text-slate-900">온라인 사용자</h3>
              <p className="text-xs text-slate-500">현재 {onlineCount}명이 온라인입니다</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {allOnlineUsers.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  온라인 사용자가 없습니다
                </div>
              ) : (
                <div className="p-2">
                  {allOnlineUsers.map((user) => (
                    <UserCard key={user.user_id} user={user} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 개별 사용자 카드 컴포넌트
const UserCard: React.FC<{ user: OnlineUser }> = ({ user }) => {
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const userTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - userTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    return userTime.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'trainer': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return '관리자';
      case 'manager': return '매니저';
      case 'trainer': return '트레이너';
      default: return '멤버';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-medium text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white">
          <Circle className="h-full w-full animate-pulse" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-slate-900 truncate">
            {user.name}
          </p>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
            {getRoleText(user.role)}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {formatTime(user.online_at)}에 접속
        </p>
      </div>
    </div>
  );
};

// 실시간 상태 풀 컴포넌트 (헤더용)
export const RealtimeStatusBar: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <ConnectionIndicator />
      <OnlineUsers />
    </div>
  );
};

// 실시간 알림 개수 표시 컴포넌트
export const RealtimeNotificationBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center"
    >
      <span className="text-xs font-bold text-white">
        {count > 99 ? '99+' : count}
      </span>
    </motion.div>
  );
};

// 개발자용 실시간 디버그 패널
export const RealtimeDebugPanel: React.FC = () => {
  const { isConnected, onlineUsers, refreshConnection } = useRealtime();
  const [isVisible, setIsVisible] = useState(false);

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const allOnlineUsers = Object.values(onlineUsers).flat();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg"
        title="실시간 디버그 패널"
      >
        <Wifi className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4"
          >
            <h3 className="font-bold text-slate-900 mb-3">실시간 디버그 정보</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>연결 상태:</span>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? '연결됨' : '연결 안됨'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>온라인 사용자:</span>
                <span>{allOnlineUsers.length}명</span>
              </div>
              
              <div className="flex justify-between">
                <span>활성 채널:</span>
                <span>{Object.keys(onlineUsers).length}개</span>
              </div>
            </div>

            <button
              onClick={refreshConnection}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded"
            >
              연결 새로고침
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 