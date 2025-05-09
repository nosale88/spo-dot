import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, User, Edit, Trash, UserPlus, ChevronDown, ChevronUp, CalendarClock, Mail, Phone, Info } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useUser, Client, UserStatus } from '../contexts/UserContext';
import clsx from 'clsx';
import AddClientForm from '../components/forms/AddClientForm';
import ClientDetails from '../components/clients/ClientDetails';
import InitialsAvatar from '../components/common/InitialsAvatar';

const Clients = () => {
  const { clients, filterUsers, filteredUsers } = useUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [filterTrainerId, setFilterTrainerId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  
  // 필터링 적용
  useEffect(() => {
    filterUsers({
      role: 'client',
      status: filterStatus !== 'all' ? filterStatus : undefined,
      searchQuery,
      trainerId: filterTrainerId || undefined
    });
  }, [searchQuery, filterStatus, filterTrainerId, clients, filterUsers]);
  
  // 필터링된 고객만 표시
  const filteredClients = filteredUsers.filter(user => user.role === 'client') as Client[];
  
  // 멤버십 상태 확인
  const getMembershipStatus = (client: Client) => {
    if (!client.membershipEnd) return 'N/A';
    
    const now = new Date();
    const endDate = new Date(client.membershipEnd);
    
    if (isBefore(endDate, now)) {
      return '만료됨';
    }
    
    if (isBefore(now, endDate) && isAfter(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), endDate)) {
      return '곧 만료';
    }
    
    return '활성';
  };
  
  // 멤버십 상태에 따른 스타일
  const getMembershipStatusStyle = (status: string) => {
    switch (status) {
      case '활성':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case '곧 만료':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case '만료됨':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  // 고객 상태에 따른 스타일
  const getStatusStyle = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'suspended':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    }
  };
  
  // 고객 상태 텍스트
  const getStatusText = (status: UserStatus) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'pending': return '대기중';
      case 'suspended': return '정지됨';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">고객 관리</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="고객 이름, 이메일, 전화번호 검색"
              className="form-input pl-10 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline inline-flex items-center"
          >
            <Filter size={16} className="mr-2" />
            필터
            {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary inline-flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            고객 추가
          </button>
        </div>
      </div>
      
      {/* 필터 패널 */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                상태
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'all')}
                className="form-input w-full"
              >
                <option value="all">모든 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">대기중</option>
                <option value="suspended">정지됨</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                담당 트레이너
              </label>
              <select
                value={filterTrainerId}
                onChange={(e) => setFilterTrainerId(e.target.value)}
                className="form-input w-full"
              >
                <option value="">모든 트레이너</option>
                <option value="trainer-1">박지민 트레이너</option>
                <option value="trainer-2">최준호 트레이너</option>
                <option value="trainer-3">김지연 트레이너</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 고객 목록 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  담당 트레이너
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  멤버십
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const membershipStatus = getMembershipStatus(client);
                  
                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowClientDetails(true);
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {client.profileImage ? (
                              <img 
                                src={client.profileImage} 
                                alt={client.name} 
                                className="h-10 w-10 rounded-full" 
                              />
                            ) : (
                              <InitialsAvatar name={client.name} size="sm" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {client.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">{client.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {client.assignedTrainerName || '미배정'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 dark:text-white">
                            {client.membershipType || 'N/A'}
                          </span>
                          <div className="flex items-center mt-1">
                            <span className={clsx(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              getMembershipStatusStyle(membershipStatus)
                            )}>
                              {membershipStatus}
                            </span>
                            {client.membershipEnd && (
                              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                ~{format(new Date(client.membershipEnd), 'yyyy.MM.dd')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={clsx(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusStyle(client.status)
                        )}>
                          {getStatusText(client.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(client);
                              setShowClientDetails(true);
                            }}
                          >
                            <Info size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    {searchQuery || filterStatus !== 'all' || filterTrainerId
                      ? '검색 결과가 없습니다. 다른 검색어나 필터를 사용해 보세요.'
                      : '등록된 고객이 없습니다. 새 고객을 추가해 보세요.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 고객 추가 폼 */}
      {showAddForm && (
        <AddClientForm onClose={() => setShowAddForm(false)} />
      )}
      
      {/* 고객 상세 정보 */}
      {showClientDetails && selectedClient && (
        <ClientDetails 
          client={selectedClient} 
          onClose={() => setShowClientDetails(false)} 
        />
      )}
    </motion.div>
  );
};

export default Clients;