# 🔧 Merge Conflict 예방 및 최적화 가이드

## 📋 현재 상황 요약

**2025년 1월 1일 기준 해결된 사항:**
- ✅ 모든 merge conflict 마크 제거 완료 (`<<<<<<< HEAD`, `=======`, `>>>>>>> commit-hash`)
- ✅ 11개 파일에서 1,846줄의 중복 코드 정리
- ✅ 코드베이스 통일성 확보
- ✅ Git 커밋 히스토리 정리 (commit: `34d12b2`)

## 🚨 Merge Conflict 발생 원인 분석

### 1. 주요 발생 패턴
```bash
# 가장 빈번했던 conflict 패턴들:
src/contexts/         # Context 파일들 (AuthContext, TaskContext 등)
src/components/tasks/ # Task 관련 컴포넌트
src/hooks/           # Custom hooks (usePermissions.ts)
src/pages/           # 주요 페이지들 (Suggestions.tsx, DailyReport.tsx)
src/services/        # API 서비스 파일들
```

### 2. 발생 원인
- **동시 개발**: 같은 파일을 여러 브랜치에서 수정
- **대규모 리팩토링**: 권한 시스템, 알림 시스템 동시 개선
- **Import 구조 변경**: 라이브러리 및 유틸리티 함수 경로 변경
- **타입 정의 충돌**: TypeScript 인터페이스 및 타입 동시 수정

## 🛡️ 예방 전략

### 1. Git 브랜치 전략 최적화

```bash
# 📁 브랜치 명명 규칙
feature/component-name-description   # 컴포넌트 관련
feature/context-name-enhancement     # Context 개선
fix/issue-description               # 버그 수정
refactor/system-name                # 리팩토링
hotfix/critical-issue               # 긴급 수정

# 🔄 작업 분리 원칙
1. Context 수정 = 별도 브랜치
2. 대규모 컴포넌트 변경 = 별도 브랜치  
3. 타입 정의 변경 = 최우선 merge
4. 공통 유틸리티 = 최우선 merge
```

### 2. 파일별 충돌 예방 규칙

#### 🎯 High-Risk Files (충돌 다발 파일들)
```typescript
// ⚠️ 주의 필요 파일들
src/contexts/AuthContext.tsx         // 인증 시스템
src/contexts/TaskContext.tsx         // 업무 관리
src/contexts/NotificationContext.tsx // 알림 시스템
src/hooks/usePermissions.ts          // 권한 관리
src/types/permissions.ts             // 권한 타입 정의
src/types/index.ts                   // 공통 타입
```

#### 📋 파일별 수정 가이드라인
```typescript
// ✅ AuthContext.tsx 수정 시
// 1. 사용자 인터페이스 변경 → 타입 먼저 merge
// 2. 권한 로직 변경 → usePermissions와 함께 작업
// 3. API 변경 → 관련 service 파일과 동시 작업 금지

// ✅ TaskContext.tsx 수정 시  
// 1. Task 타입 변경 → types/index.ts 먼저 수정
// 2. UI 컴포넌트 변경 → Context 수정 후 진행
// 3. 상태 관리 변경 → 관련 hooks와 분리 작업

// ✅ 공통 유틸리티 수정 시
// 1. utils/ 폴더 → 최우선 merge 필요
// 2. services/ 폴더 → API 변경 시 관련 팀원 공지
// 3. types/ 폴더 → 변경 즉시 merge 필수
```

### 3. 코드 작성 Best Practices

#### 🏗️ 구조적 예방
```typescript
// ❌ 충돌 유발 패턴
export const MyComponent = () => {
  // 여러 기능이 한 파일에 몰려있음
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // ... 100줄의 로직
};

// ✅ 충돌 방지 패턴
export const MyComponent = () => {
  const { state1, actions1 } = useFeature1(); // 분리된 hook
  const { state2, actions2 } = useFeature2(); // 분리된 hook
  
  return <ComponentView {...{ state1, state2, actions1, actions2 }} />;
};
```

#### 📦 Import 구조 최적화
```typescript
// ✅ 안정적인 import 구조
// 1. 절대 경로 사용
import { AuthContext } from '@/contexts/AuthContext';
import { TaskType } from '@/types';

// 2. 배럴 export 활용
// types/index.ts
export * from './permissions';
export * from './user';
export * from './task';

// 3. 조건부 import 최소화
import { ComponentA } from '@/components/ComponentA';
// const ComponentB = lazy(() => import('@/components/ComponentB'));
```

## 🔧 자동화 도구 설정

### 1. Git Hooks 설정
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "🔍 Merge conflict 마크 검사 중..."

# Merge conflict 마크 검사
if grep -r "<<<<<<< HEAD\|=======\|>>>>>>> " src/; then
    echo "❌ Merge conflict 마크가 발견되었습니다!"
    echo "파일을 확인하고 conflict를 해결한 후 다시 커밋하세요."
    exit 1
fi

echo "✅ Merge conflict 검사 통과"
```

### 2. VSCode 설정 최적화
```json
// .vscode/settings.json
{
  "merge-conflict.autoNavigateNextConflict.enabled": true,
  "merge-conflict.codeLens.enabled": true,
  "merge-conflict.decorators.enabled": true,
  "git.mergeEditor": true,
  "diffEditor.experimental.showMoves": true,
  "diffEditor.experimental.useDiffHunk": true
}
```

### 3. Prettier/ESLint 통일화
```json
// .eslintrc.json - 충돌 방지 규칙
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "alphabetize": { "order": "asc" }
    }],
    "sort-keys": ["error", "asc"],
    "object-shorthand": "error"
  }
}
```

## 📋 일일 체크리스트

### 🌅 작업 시작 전
```bash
# 1. 최신 코드 동기화
git checkout main
git pull origin main

# 2. 새 브랜치 생성
git checkout -b feature/your-feature-name

# 3. 충돌 위험 파일 확인
git log --oneline -10 | grep -E "(context|hook|type)"
```

### 🔄 작업 중간
```bash
# 1. 정기적 rebase (충돌 최소화)
git fetch origin
git rebase origin/main

# 2. 충돌 마크 자동 검사
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "<<<<<<< HEAD"

# 3. 타입 체크
npm run type-check
```

### 🚀 작업 완료 후
```bash
# 1. 최종 conflict 검사
./scripts/check-conflicts.sh

# 2. 빌드 테스트
npm run build

# 3. PR 생성 전 체크
npm run lint
npm run test
```

## 🛠️ 자동화 스크립트

### 충돌 검사 스크립트
```bash
#!/bin/bash
# scripts/check-conflicts.sh

echo "🔍 Merge Conflict 검사 시작..."

# 1. Conflict 마크 검사
CONFLICT_FILES=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "<<<<<<< HEAD\|=======\|>>>>>>> ")

if [ ! -z "$CONFLICT_FILES" ]; then
    echo "❌ 다음 파일들에서 merge conflict 발견:"
    echo "$CONFLICT_FILES"
    exit 1
fi

# 2. 빌드 테스트
echo "🏗️ 빌드 테스트 중..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ 모든 검사 통과! 안전하게 merge 가능합니다."
else
    echo "❌ 빌드 실패. 코드를 확인해주세요."
    exit 1
fi
```

### 충돌 해결 스크립트
```bash
#!/bin/bash
# scripts/resolve-conflicts.sh

echo "🔧 Merge Conflict 자동 해결 시작..."

# 1. HEAD 버전 선택 (현재 브랜치 우선)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' '/^<<<<<<< HEAD$/,/^=======$/d'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' '/^>>>>>>> /d'

# 2. 포맷팅 정리
npm run format

# 3. 검증
npm run lint --fix

echo "✅ 자동 해결 완료. 수동 검토 후 커밋하세요."
```

## 📈 모니터링 및 개선

### 1. 월간 충돌 분석
```bash
# 월간 merge conflict 통계
git log --since="1 month ago" --grep="Fix.*merge conflict" --oneline | wc -l

# 가장 충돌이 많은 파일들
git log --since="1 month ago" --name-only --pretty=format: | sort | uniq -c | sort -nr | head -10
```

### 2. 팀 협업 개선점
- **코드 리뷰**: 충돌 위험 파일 수정 시 필수 리뷰
- **페어 프로그래밍**: Context/Hook 수정 시 권장
- **아키텍처 논의**: 대규모 변경 전 팀 논의

## 🎯 결론

**핵심 원칙:**
1. **분리**: 큰 변경사항을 작은 단위로 분할
2. **우선순위**: 공통 파일(types, utils) 최우선 merge
3. **자동화**: 검사 도구로 human error 방지
4. **소통**: 충돌 위험 작업 시 팀원 공지

**성공 지표:**
- ✅ Merge conflict 0건/주 유지
- ✅ 빌드 실패 0건/배포 달성  
- ✅ 코드 리뷰 시간 30% 단축
- ✅ 개발 생산성 향상

---
*최종 업데이트: 2025-01-01*
*담당자: AI Assistant* 