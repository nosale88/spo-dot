// 실제 API 호출을 하지 않는 Mock Supabase 클라이언트
// 로그인 기능이 제거되었기 때문에 필요 없습니다.

// 간단한 Mock Supabase 객체 
// 모든 메서드는 빈 데이터와 null 에러를 반환
export const supabase = {
  // 이 mock 객체는 실제 API 호출을 시도하지 않습니다
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
  auth: {
    signIn: () => Promise.resolve({ user: null, session: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
    }),
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
    unsubscribe: () => {},
  }),
};

// Mock 객체 사용 로그
console.warn('Supabase 대신 Mock 데이터를 사용합니다. 실제 데이터베이스 기능이 작동하지 않습니다.'); 