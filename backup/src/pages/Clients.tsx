import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, User, MoreHorizontal, Phone, Mail, Calendar, Activity, Star, Eye } from 'lucide-react';
import { format } from 'date-fns';
import AddClientForm from '../components/forms/AddClientForm';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: Date;
  lastVisit: Date;
  status: 'active' | 'inactive';
  trainerName: string | null;
  notes: string;
}

const generateClients = (): Client[] => {
  return [
    {
      id: '1',
      name: '김민준',
      email: 'minjun.kim@example.com',
      phone: '010-1234-5678',
      membershipType: '프리미엄',
      joinDate: new Date(2023, 0, 15),
      lastVisit: new Date(2024, 1, 20),
      status: 'active',
      trainerName: '박트레이너',
      notes: '주 3회 PT 진행 중'
    },
    {
      id: '2',
      name: '이서연',
      email: 'seoyeon.lee@example.com',
      phone: '010-2345-6789',
      membershipType: '스탠다드',
      joinDate: new Date(2023, 2, 10),
      lastVisit: new Date(2024, 1, 19),
      status: 'active',
      trainerName: null,
      notes: '요가 클래스 참여 중'
    }
  ];
};

const Clients = () => {
  const [clients] = useState<Client[]>(generateClients());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddClient = (data: Partial<Client>) => {
    // TODO: 실제 데이터베이스에 저장하는 로직 구현
    console.log('New client:', data);
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchQuery)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">고객 관리</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 py-2 text-sm w-full"
            />
          </div>
          
          <button className="btn btn-outline inline-flex items-center">
            <Filter size={16} className="mr-2" />
            필터
          </button>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus size={16} className="mr-2" />
            고객 추가
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  고객 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  멤버십
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  최근 방문
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  상태
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {client.name}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 dark:text-white">{client.membershipType}</div>
                    {client.trainerName && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        트레이너: {client.trainerName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(client.joinDate, 'yyyy-MM-dd')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Activity className="h-4 w-4 mr-2" />
                      {format(client.lastVisit, 'yyyy-MM-dd')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {client.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                        <Eye size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                        <Star size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <AddClientForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddClient}
        />
      )}
    </motion.div>
  );
};

export default Clients;