import { Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">피트니스 센터 관리</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            전문적인 피트니스 센터 관리 시스템
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <Outlet />
        </div>
        
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
          © 2025 피트니스 센터 관리 시스템. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthLayout;