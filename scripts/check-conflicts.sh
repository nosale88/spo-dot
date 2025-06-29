#!/bin/bash

# 🔍 Merge Conflict 검사 스크립트
# 사용법: ./scripts/check-conflicts.sh

echo "🔍 Merge Conflict 검사 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Conflict 마크 검사
echo "${BLUE}1. Conflict 마크 검사 중...${NC}"
CONFLICT_FILES=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "<<<<<<< HEAD\|=======\|>>>>>>> " 2>/dev/null || true)

if [ ! -z "$CONFLICT_FILES" ]; then
    echo "${RED}❌ 다음 파일들에서 merge conflict 발견:${NC}"
    echo "$CONFLICT_FILES"
    echo "${YELLOW}💡 해결 방법: 각 파일을 열어서 충돌 마크를 제거하세요.${NC}"
    exit 1
fi

echo "${GREEN}✅ Conflict 마크 없음${NC}"

# 2. TypeScript 타입 검사
echo "${BLUE}2. TypeScript 타입 검사 중...${NC}"
if command -v tsc &> /dev/null; then
    tsc --noEmit --skipLibCheck
    if [ $? -ne 0 ]; then
        echo "${RED}❌ TypeScript 타입 에러 발견${NC}"
        exit 1
    fi
    echo "${GREEN}✅ TypeScript 타입 검사 통과${NC}"
else
    echo "${YELLOW}⚠️  TypeScript 컴파일러를 찾을 수 없습니다${NC}"
fi

# 3. ESLint 검사
echo "${BLUE}3. ESLint 검사 중...${NC}"
if command -v eslint &> /dev/null && [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
    npm run lint > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "${YELLOW}⚠️  ESLint 에러가 있습니다. 'npm run lint'로 확인하세요${NC}"
    else
        echo "${GREEN}✅ ESLint 검사 통과${NC}"
    fi
else
    echo "${YELLOW}⚠️  ESLint 설정을 찾을 수 없습니다${NC}"
fi

# 4. 빌드 테스트
echo "${BLUE}4. 빌드 테스트 중...${NC}"
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ 빌드 성공${NC}"
else
    echo "${RED}❌ 빌드 실패. 'npm run build'로 상세 에러를 확인하세요${NC}"
    exit 1
fi

# 5. 위험 파일 변경 확인
echo "${BLUE}5. 위험 파일 변경 확인 중...${NC}"
RISKY_FILES="src/contexts/ src/hooks/usePermissions.ts src/types/"
CHANGED_RISKY_FILES=$(git diff --name-only HEAD~1 2>/dev/null | grep -E "(contexts/|usePermissions|types/)" || true)

if [ ! -z "$CHANGED_RISKY_FILES" ]; then
    echo "${YELLOW}⚠️  충돌 위험 파일들이 변경되었습니다:${NC}"
    echo "$CHANGED_RISKY_FILES"
    echo "${YELLOW}💡 이 파일들은 다른 개발자와 충돌 가능성이 높습니다. 우선 merge를 고려하세요.${NC}"
fi

echo ""
echo "${GREEN}🎉 모든 검사 통과! 안전하게 merge 가능합니다.${NC}"
echo "${BLUE}📋 다음 단계:${NC}"
echo "   1. git add ."
echo "   2. git commit -m 'your message'"
echo "   3. git push origin your-branch" 