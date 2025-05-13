import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Customer, ConsultingRecord } from '../types/customer';
import { v4 as uuidv4 } from 'uuid';

// Mock 고객 데이터 생성
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    name: "김민수",
    phone: "010-1234-5678",
    email: "minsu@example.com",
    registeredAt: "2023-09-15T09:00:00Z",
    membershipType: "fitness",
    membershipStart: "2023-09-15",
    membershipEnd: "2024-09-14",
    ptCount: 10,
    otCount: 1,
    status: "active",
    consultant: "박코치",
    registerSource: "offline",
    notes: "PT 회원권 포함, 주 3회 방문 예정"
  },
  {
    id: "cust-002",
    name: "이지연",
    phone: "010-9876-5432",
    email: "jiyeon@example.com",
    registeredAt: "2023-10-22T10:30:00Z",
    membershipType: "tennis",
    membershipStart: "2023-10-25",
    membershipEnd: "2024-04-24",
    lessonCount: 5,
    status: "active",
    consultant: "김코치",
    registerSource: "phone",
    notes: "테니스 초보, 주말 레슨 희망"
  },
  {
    id: "cust-003",
    name: "박준호",
    phone: "010-2345-6789",
    email: "junho@example.com",
    registeredAt: "2023-08-05T14:15:00Z",
    membershipType: "golf",
    status: "expired",
    registerSource: "inquiry",
    notes: "골프 회원권 문의만 하고 미가입"
  },
  {
    id: "cust-004",
    name: "최수진",
    phone: "010-3456-7890",
    email: "sujin@example.com",
    registeredAt: "2023-11-10T16:45:00Z",
    membershipType: "combo",
    membershipStart: "2023-11-15",
    membershipEnd: "2024-11-14",
    ptCount: 20,
    otCount: 1,
    lessonCount: 10,
    status: "active",
    consultant: "FC 이지원",
    registerSource: "consulting",
    notes: "FC 담당, PT와 골프 레슨 병행 예정"
  },
  {
    id: "cust-005",
    name: "정다영",
    phone: "010-4567-8901",
    email: "dayoung@example.com",
    registeredAt: "2023-07-20T11:20:00Z",
    membershipType: "fitness",
    membershipStart: "2023-07-25",
    membershipEnd: "2023-10-24",
    ptCount: 0,
    status: "paused",
    consultant: "김상담",
    registerSource: "membership",
    notes: "3개월 후 재등록 예정, PT 상담 필요"
  },
  {
    id: "cust-006",
    name: "손영호",
    phone: "010-5678-9012",
    email: "youngho@example.com",
    registeredAt: "2023-12-05T13:30:00Z",
    membershipType: "tennis",
    lessonCount: 8,
    status: "withdrawn",
    registerSource: "online",
    notes: "무인증 레슨 요청"
  },
  {
    id: "cust-007",
    name: "조민지",
    phone: "010-6789-0123",
    email: "minji@example.com",
    registeredAt: "2024-01-12T09:45:00Z",
    membershipType: "fitness",
    status: "active",
    registerSource: "visit",
    notes: "투어만 하고 아직 미결정"
  },
  {
    id: "cust-008",
    name: "윤서준",
    phone: "010-7890-1234",
    email: "seojun@example.com",
    registeredAt: "2024-02-18T15:10:00Z",
    membershipType: "golf",
    membershipStart: "2024-03-01",
    membershipEnd: "2024-09-01",
    lessonCount: 0,
    status: "active",
    consultant: "박프로",
    registerSource: "phone",
    notes: "무료 체험 이후 등록, 연락망/스케줄 정리 필요"
  },
  {
    id: "cust-009",
    name: "안예진",
    phone: "010-8901-2345",
    email: "yejin@example.com",
    registeredAt: "2024-03-05T10:25:00Z",
    membershipType: "fitness",
    ptCount: 0,
    otCount: 1,
    status: "active",
    consultant: "강트레이너",
    registerSource: "membership",
    notes: "OT 완료, PT 상담 예정"
  },
  {
    id: "cust-010",
    name: "한승우",
    phone: "010-9012-3456",
    email: "seungwoo@example.com",
    registeredAt: "2024-03-10T16:20:00Z",
    membershipType: "tennis",
    membershipStart: "2024-03-15",
    membershipEnd: "2024-09-14",
    lessonCount: 5,
    status: "active",
    consultant: "FC 박민지",
    registerSource: "consulting",
    notes: "FC LOG 필요, 피드백 요청함"
  },
  {
    id: "cust-011",
    name: "유지훈",
    phone: "010-0123-4567",
    email: "jihoon@example.com",
    registeredAt: "2024-03-18T14:35:00Z",
    membershipType: "combo",
    status: "active",
    registerSource: "referral",
    notes: "질문 많음, 상담 필요"
  },
  {
    id: "cust-012",
    name: "임서연",
    phone: "010-1234-5670",
    email: "seoyeon@example.com",
    registeredAt: new Date().toISOString(),
    membershipType: "fitness",
    status: "active",
    registerSource: "visit",
    notes: "오늘 방문, 상담예약 잡음"
  }
];

// 타입 정의
interface CustomerContextType {
  customers: Customer[];
  filtered: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: Error | null;
  addCustomer: (customerData: Omit<Customer, 'id' | 'registeredAt'>) => Promise<string>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  searchCustomers: (query: string) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  addConsultingHistory: (customerId: string, record: ConsultingRecord) => Promise<void>;
}

// 기본 컨텍스트 생성
const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// 컨텍스트 제공자 컴포넌트
export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [filtered, setFiltered] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 고객 검색 기능
  const searchCustomers = (query: string) => {
    if (!query) {
      setFiltered(customers);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const results = customers.filter(
      customer =>
        customer.name.toLowerCase().includes(lowercaseQuery) ||
        customer.phone.includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(lowercaseQuery))
    );
    setFiltered(results);
  };

  // 고객 추가 기능
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'registeredAt'>): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer: Customer = {
        ...customerData,
        id: uuidv4(),
        registeredAt: new Date().toISOString(),
      };

      setCustomers(prev => [...prev, newCustomer]);
      setFiltered(prev => [...prev, newCustomer]);
      return newCustomer.id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add customer'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 고객 정보 업데이트 기능
  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(prev =>
        prev.map(cust =>
          cust.id === id ? { ...cust, ...customerData } : cust
        )
      );
      setFiltered(prev =>
        prev.map(cust =>
          cust.id === id ? { ...cust, ...customerData } : cust
        )
      );
      
      // 현재 선택된 고객이 업데이트된 고객이면 선택된 고객도 업데이트
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer({ ...selectedCustomer, ...customerData });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update customer'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 고객 삭제 기능
  const deleteCustomer = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(prev => prev.filter(cust => cust.id !== id));
      setFiltered(prev => prev.filter(cust => cust.id !== id));
      
      // 현재 선택된 고객이 삭제된 고객이면 선택 해제
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete customer'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ID로 고객 조회 기능
  const getCustomerById = async (id: string): Promise<Customer | null> => {
    setLoading(true);
    setError(null);
    try {
      const customer = customers.find(cust => cust.id === id) || null;
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get customer'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 상담 기록 추가 기능
  const addConsultingHistory = async (customerId: string, record: ConsultingRecord): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const customer = customers.find(cust => cust.id === customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const updatedHistory = [...(customer.consultingHistory || []), record];
      
      await updateCustomer(customerId, {
        consultingHistory: updatedHistory
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add consulting record'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        filtered,
        selectedCustomer,
        loading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        searchCustomers,
        setSelectedCustomer,
        addConsultingHistory
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

// 컨텍스트 사용을 위한 커스텀 훅
export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}; 