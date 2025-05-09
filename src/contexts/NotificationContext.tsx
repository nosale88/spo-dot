import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 알림 유형 타입
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

interface NotificationContextType {
  showToast: (type: NotificationType, title: string, message: string, duration?: number) => void;
  dismissToast: () => void;
  isToastVisible: boolean;
  toastType: NotificationType;
  toastTitle: string;
  toastMessage: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastType, setToastType] = useState<NotificationType>('info');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastDuration, setToastDuration] = useState(3000);
  const [toastTimeoutId, setToastTimeoutId] = useState<number | undefined>(undefined);

  const showToast = (
    type: NotificationType,
    title: string,
    message: string,
    duration = 3000
  ) => {
    // 이미 표시 중인 토스트가 있으면 해당 타이머 제거
    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
      setToastTimeoutId(undefined);
    }

    // 토스트 상태 업데이트
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message);
    setToastDuration(duration);
    setIsToastVisible(true);

    // 지정된 시간 후 토스트 숨기기
    const timeoutId = window.setTimeout(() => {
      setIsToastVisible(false);
    }, duration);

    setToastTimeoutId(Number(timeoutId));
  };

  const dismissToast = () => {
    setIsToastVisible(false);
    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
      setToastTimeoutId(undefined);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimeoutId) {
        window.clearTimeout(toastTimeoutId);
      }
    };
  }, [toastTimeoutId]);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        dismissToast,
        isToastVisible,
        toastType,
        toastTitle,
        toastMessage
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within a NotificationProvider");
  return context;
}; 