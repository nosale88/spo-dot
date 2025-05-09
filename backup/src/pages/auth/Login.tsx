import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">로그인</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-300">
          <AlertCircle size={18} className="flex-shrink-0 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            이메일
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-slate-400" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', { 
                required: '이메일을 입력해주세요', 
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: '유효한 이메일을 입력해주세요'
                }
              })}
              className="form-input pl-10"
              placeholder="your@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            비밀번호
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-slate-400" />
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', { required: '비밀번호를 입력해주세요' })}
              className="form-input pl-10"
              placeholder="********"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              로그인 유지
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              비밀번호 찾기
            </a>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          계정이 없으신가요?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">테스트 계정</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-100 dark:bg-slate-700">
            <p className="font-semibold">관리자</p>
            <p>admin@example.com</p>
            <p>password123</p>
          </div>
          <div className="p-2 rounded bg-slate-100 dark:bg-slate-700">
            <p className="font-semibold">트레이너</p>
            <p>trainer@example.com</p>
            <p>password123</p>
          </div>
          <div className="p-2 rounded bg-slate-100 dark:bg-slate-700">
            <p className="font-semibold">직원</p>
            <p>staff@example.com</p>
            <p>password123</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;