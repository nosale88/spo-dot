import * as CryptoJS from 'crypto-js';

// 🔐 보안 유틸리티

// JWT 토큰 관련
export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  exp: number;
  iat: number;
}

// 간단한 JWT 구현 (실제로는 서버에서 처리해야 함)
const JWT_SECRET = 'your-super-secret-key-change-in-production';

export const createJWT = (payload: Omit<JWTPayload, 'exp' | 'iat'>): string => {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60) // 24시간
  };
  
  const token = btoa(JSON.stringify(fullPayload));
  const signature = CryptoJS.HmacSHA256(token, JWT_SECRET).toString();
  
  return `${token}.${signature}`;
};

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    const [payload, signature] = token.split('.');
    const expectedSignature = CryptoJS.HmacSHA256(payload, JWT_SECRET).toString();
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const decoded: JWTPayload = JSON.parse(atob(payload));
    
    // 만료 검증
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
};

// 비밀번호 해싱
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + 'spodot_salt_2024').toString();
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// API 요청 인터셉터
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }
  
  const payload = verifyJWT(token);
  if (!payload) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    throw new Error('토큰이 만료되었거나 유효하지 않습니다.');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// 권한 검증 데코레이터
export const withPermissionCheck = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  requiredPermission: string
) => {
  return async (...args: T): Promise<R> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    
    const payload = verifyJWT(token);
    if (!payload) {
      throw new Error('인증이 만료되었습니다.');
    }
    
    // 권한 검증 로직 (실제로는 서버에서 수행)
    // 여기서는 클라이언트 측 검증만 수행
    
    return fn(...args);
  };
};

// 데이터 암호화/복호화
export const encryptSensitiveData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, JWT_SECRET).toString();
};

export const decryptSensitiveData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, JWT_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// 세션 관리
export const isSessionValid = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  const payload = verifyJWT(token);
  return payload !== null;
};

export const refreshSession = async (): Promise<boolean> => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  const payload = verifyJWT(token);
  if (!payload) return false;
  
  // 토큰이 1시간 이내 만료될 경우 갱신
  const oneHour = 60 * 60;
  if (payload.exp - Math.floor(Date.now() / 1000) < oneHour) {
    try {
      const newToken = createJWT({
        userId: payload.userId,
        role: payload.role,
        email: payload.email
      });
      localStorage.setItem('authToken', newToken);
      return true;
    } catch {
      return false;
    }
  }
  
  return true;
};

// XSS 방지
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL 인젝션 방지를 위한 입력 검증
export const validateInput = (input: string, type: 'email' | 'password' | 'text' | 'number'): boolean => {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'password':
      return input.length >= 8; // 8자 이상이면 통과 (영문/숫자 조건 제거)
    case 'text':
      return input.length > 0 && input.length <= 1000;
    case 'number':
      return !isNaN(Number(input)) && Number(input) >= 0;
    default:
      return false;
  }
};

// 레이트 리미팅
const requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

export const checkRateLimit = (endpoint: string, limit: number = 100, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const key = `${endpoint}`;
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}; 