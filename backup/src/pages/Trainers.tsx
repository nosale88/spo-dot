import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, UserPlus, Phone, Mail, Calendar, Award, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

// 트레이너 타입
interface Trainer {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  startDate: Date;
  status: 'active' | 'onLeave' | 'terminated';
  specialty: string[];
  clients: number;
  rating: number;
  weeklyHours: number;
  profileImage?: string;
  bio?: string;
}

// 임시 트레이너 데이터
const generateTrainers = (): Trainer[] => {
  const trainers: Trainer[] = [];
  
  const names = ['김철수', '이영희', '박지민', '최준호', '정민지', '강현우'];
  const statuses: Array<'active' | 'onLeave' | 'terminated'> = ['active', 'onLeave', 'terminated'];
  const specialties = [
    ['웨이트 트레이닝', '체중 관리'],
    ['요가', '필라테스', '유산소'],
    ['기능성 트레이닝', '재활'],
    ['보디빌딩', '근력 강화'],
    ['크로스핏', 'HIIT'],
    ['스포츠 컨디셔닝', '영양 관리']
  ];
  
  for (let i = 0; i < 6; i++) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - Math.floor(Math.random() * 5) - 1);
    
    trainers.push({
      id: i + 1,
      name: names[i],
      email: `trainer${i + 1}@example.com`,
      phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      role: i === 0 ? '수석 트레이너' : '트레이너',
      startDate,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      specialty: specialties[i],
      clients: 10 + Math.floor(Math.random() * 20),
      rating: 3 + Math.random() * 2,
      weeklyHours: 20 + Math.floor(Math.random() * 20),
      profileImage: `https://i.pravatar.cc/150?img=${i + 10}`,
      bio: i % 2 === 0 ? '건강한 생활을 위한 전문 트레이너로 웨이트 트레이닝과 영양 관리를 전문으로 지도합니다.' : undefined
    });
  }
  
  return trainers;
};

const Trainers = () => {
  const [trainers] = useState<Trainer[]>(generateTrainers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  
  // 검색 및 필터링된 트레이너 목록
  const filteredTrainers = trainers.filter(trainer => 
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // 상태에 따른 배지 스타일
  const getStatusBadgeStyle = (status: 'active' | 'onLeave' | 'terminated') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'onLeave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };
  
  // 상태 텍스트
  const getStatusText = (status: 'active' | 'onLeave' | 'terminated') => {
    switch (status) {
      case 'active': return '활성';
      case 'onLeave': return '휴가중';
      case 'terminated': return '퇴사';
    }
  };
  
  // 평점 별표 렌더링
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={i < fullStars ? 'currentColor' : (i === fullStars && hasHalfStar ? 'url(#halfStar)' : 'none')}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-400"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            <defs>
              <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        ))}
        <span className="ml-1 text-sm text-slate-600 dark:text-slate-400">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">트레이너 관리</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="이름, 이메일, 전문 분야로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 py-2 text-sm w-full"
            />
          </div>
          
          <button className="btn btn-primary inline-flex items-center">
            <UserPlus size={16} className="mr-2" />
            트레이너 추가
          </button>
        </div>
      </div>
      
      {/* 트레이너 목록 - 카드 그리드 뷰 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => (
          <motion.div
            key={trainer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="card overflow-hidden"
            onClick={() => setSelectedTrainer(trainer)}
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img 
                src={trainer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.name)}&background=random`} 
                alt={trainer.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 p-4 z-20">
                <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                <p className="text-slate-200 text-sm">{trainer.role}</p>
              </div>
              <div className="absolute top-2 right-2 z-20">
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeStyle(trainer.status)}`}>
                  {getStatusText(trainer.status)}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-1">
                {trainer.specialty.map((spec, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">담당 고객</p>
                  <p className="font-medium text-slate-900 dark:text-white">{trainer.clients}명</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">주간 시간</p>
                  <p className="font-medium text-slate-900 dark:text-white">{trainer.weeklyHours}시간</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">시작일</p>
                  <p className="font-medium text-slate-900 dark:text-white">{format(trainer.startDate, 'yyyy-MM-dd')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">평점</p>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {renderStars(trainer.rating)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 truncate">{trainer.email}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Phone size={16} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{trainer.phone}</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <button className="btn btn-sm btn-outline inline-flex items-center">
                <Calendar size={14} className="mr-1" />
                일정 보기
              </button>
              <button className="btn btn-sm btn-primary inline-flex items-center">
                <Eye size={14} className="mr-1" />
                상세 정보
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* 선택된 트레이너 상세 정보 */}
      {selectedTrainer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => setSelectedTrainer(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <img 
                src={selectedTrainer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTrainer.name)}&background=random`} 
                alt={selectedTrainer.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="p-1 rounded-full bg-black/20 text-white hover:bg-black/40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 z-20">
                <h2 className="text-2xl font-bold text-white">{selectedTrainer.name}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-slate-200">{selectedTrainer.role}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeStyle(selectedTrainer.status)}`}>
                    {getStatusText(selectedTrainer.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">연락처 정보</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Mail size={16} className="text-slate-400 mr-2" />
                          <span className="text-slate-900 dark:text-white">{selectedTrainer.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone size={16} className="text-slate-400 mr-2" />
                          <span className="text-slate-900 dark:text-white">{selectedTrainer.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">시작일</h3>
                      <div className="flex items-center">
                        <Calendar size={16} className="text-slate-400 mr-2" />
                        <span className="text-slate-900 dark:text-white">{format(selectedTrainer.startDate, 'yyyy년 MM월 dd일')}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">평점</h3>
                      <div className="text-slate-900 dark:text-white">
                        {renderStars(selectedTrainer.rating)}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">전문 분야</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrainer.specialty.map((spec, index) => (
                          <span 
                            key={index} 
                            className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="card p-4">
                      <div className="flex items-center mb-2">
                        <UserPlus size={20} className="text-primary mr-2" />
                        <h4 className="font-medium text-slate-900 dark:text-white">담당 고객</h4>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTrainer.clients}명</p>
                    </div>
                    
                    <div className="card p-4">
                      <div className="flex items-center mb-2">
                        <Clock size={20} className="text-primary mr-2" />
                        <h4 className="font-medium text-slate-900 dark:text-white">주간 근무</h4>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTrainer.weeklyHours}시간</p>
                    </div>
                    
                    <div className="card p-4">
                      <div className="flex items-center mb-2">
                        <Award size={20} className="text-primary mr-2" />
                        <h4 className="font-medium text-slate-900 dark:text-white">경력</h4>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {new Date().getFullYear() - selectedTrainer.startDate.getFullYear()}년
                      </p>
                    </div>
                  </div>
                  
                  {selectedTrainer.bio && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">자기소개</h3>
                      <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                        {selectedTrainer.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">이번 주 일정</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">요일</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">시간</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">세션 수</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">{day}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                {i < 5 ? '09:00 - 18:00' : i === 5 ? '10:00 - 15:00' : '휴무'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                {i < 5 ? Math.floor(Math.random() * 8) + 4 : i === 5 ? Math.floor(Math.random() * 4) + 1 : 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-primary">프로필 수정</button>
                    <button className="btn btn-outline">일정 관리</button>
                    <button className="btn btn-outline">고객 목록</button>
                    <button className="btn btn-outline">성과 보고서</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Trainers;