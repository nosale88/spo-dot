import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotification, NotificationType } from '../../contexts/NotificationContext';

const Toast = () => {
  const { isToastVisible, toastType, toastTitle, toastMessage, dismissToast } = useNotification();

  const getToastStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          titleColor: 'text-green-800 dark:text-green-300',
          messageColor: 'text-green-600 dark:text-green-400'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          titleColor: 'text-red-800 dark:text-red-300',
          messageColor: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          titleColor: 'text-yellow-800 dark:text-yellow-300',
          messageColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          titleColor: 'text-blue-800 dark:text-blue-300',
          messageColor: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const styles = getToastStyles(toastType);

  return (
    <AnimatePresence>
      {isToastVisible && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`rounded-lg shadow-md border ${styles.borderColor} ${styles.bgColor} p-4`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {styles.icon}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${styles.titleColor}`}>
                  {toastTitle}
                </h3>
                {toastMessage && (
                  <p className={`mt-1 text-sm ${styles.messageColor}`}>
                    {toastMessage}
                  </p>
                )}
              </div>
              <button
                onClick={dismissToast}
                className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 