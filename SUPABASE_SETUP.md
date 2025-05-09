# Supabase 설정 가이드

## 1. 환경 변수 설정하기

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Supabase URL과 Anon Key 찾는 방법

1. [Supabase 대시보드](https://app.supabase.io/)에 로그인하세요
2. 프로젝트를 선택하세요
3. 왼쪽 사이드바에서 "Project Settings" 클릭
4. "API" 탭 선택
5. "Project URL"과 "anon public" key를 복사하여 환경 변수에 붙여넣기

## 3. 데이터베이스 설정

예제 컴포넌트는 'profiles' 테이블을 사용합니다. 다음 SQL을 실행하여 테이블을 생성하세요:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 샘플 데이터 추가
INSERT INTO profiles (username) VALUES 
  ('user1'),
  ('user2'),
  ('user3');
```

## 4. 사용 예제

`src/components/supabase/SupabaseExample.tsx` 파일에서 기본 Supabase 사용 예제를 확인할 수 있습니다.

```typescript
// 데이터 가져오기 예제
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .limit(5)

// 데이터 삽입 예제
const { data, error } = await supabase
  .from('table_name')
  .insert([{ column1: 'value1', column2: 'value2' }])

// 데이터 업데이트 예제
const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('id', 'row_id')

// 데이터 삭제 예제
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 'row_id')
```

## 5. 인증 기능 사용하기

인증 기능을 추가하려면 다음과 같이 사용하세요:

```typescript
// 회원가입
const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
})

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'example@email.com',
  password: 'example-password',
})

// 로그아웃
const { error } = await supabase.auth.signOut()

// 현재 사용자 정보 가져오기
const { data: { user } } = await supabase.auth.getUser()
```

자세한 내용은 [Supabase 공식 문서](https://supabase.com/docs)를 참조하세요. 