import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-6">페이지를 찾을 수 없습니다</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
          요청하신 페이지가 존재하지 않거나, 삭제되었거나, 주소가 변경되었을 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
        >
          <Home className="mr-2" size={18} />
          홈으로 돌아가기
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;