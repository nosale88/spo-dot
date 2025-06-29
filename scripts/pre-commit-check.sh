#!/bin/bash

# 🔍 Pre-commit 검사 스크립트
# Git hook으로 사용하거나 수동 실행 가능
# 사용법: ./scripts/pre-commit-check.sh

echo "🔍 Pre-commit 검사 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

EXIT_CODE=0

# 1. Merge conflict 마크 검사
echo "${BLUE}1. Merge conflict 마크 검사 중...${NC}"
if grep -r "<<<<<<< HEAD\|=======\|>>>>>>> " src/ > /dev/null 2>&1; then
    echo "${RED}❌ Merge conflict 마크가 발견되었습니다!${NC}"
    echo "${YELLOW}💡 다음 파일들을 확인하세요:${NC}"
    grep -r "<<<<<<< HEAD\|=======\|>>>>>>> " src/ | cut -d: -f1 | sort | uniq
    EXIT_CODE=1
else
    echo "${GREEN}✅ Merge conflict 마크 없음${NC}"
fi

# 2. console.log 검사 (프로덕션 코드)
echo "${BLUE}2. console.log 검사 중...${NC}"
CONSOLE_FILES=$(grep -r "console\.log\|console\.error\|console\.warn" src/ --include="*.tsx" --include="*.ts" | grep -v "// @dev-only" | cut -d: -f1 | sort | uniq 2>/dev/null || true)

if [ ! -z "$CONSOLE_FILES" ]; then
    echo "${YELLOW}⚠️  다음 파일들에서 console.log 발견:${NC}"
    echo "$CONSOLE_FILES"
    echo "${YELLOW}💡 프로덕션 코드에서는 logger 사용을 권장합니다${NC}"
    # EXIT_CODE=1  # console.log는 경고만 (빌드 실패하지 않음)
else
    echo "${GREEN}✅ console.log 없음${NC}"
fi

# 3. 임시 코드 검사
echo "${BLUE}3. 임시 코드 검사 중...${NC}"
TEMP_CODE=$(grep -r "TODO\|FIXME\|XXX\|HACK\|TEMP" src/ --include="*.tsx" --include="*.ts" | wc -l)

if [ "$TEMP_CODE" -gt 0 ]; then
    echo "${YELLOW}⚠️  $TEMP_CODE 개의 임시 코드 마크 발견${NC}"
    echo "${YELLOW}💡 배포 전에 정리를 권장합니다${NC}"
else
    echo "${GREEN}✅ 임시 코드 마크 없음${NC}"
fi

# 4. 타입 에러 검사
echo "${BLUE}4. TypeScript 타입 검사 중...${NC}"
if command -v tsc &> /dev/null; then
    tsc --noEmit --skipLibCheck > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "${RED}❌ TypeScript 타입 에러 발견${NC}"
        echo "${YELLOW}💡 'npx tsc --noEmit'로 상세 에러를 확인하세요${NC}"
        EXIT_CODE=1
    else
        echo "${GREEN}✅ TypeScript 타입 검사 통과${NC}"
    fi
else
    echo "${YELLOW}⚠️  TypeScript 컴파일러를 찾을 수 없습니다${NC}"
fi

# 5. 큰 파일 검사 (1MB 이상)
echo "${BLUE}5. 큰 파일 검사 중...${NC}"
LARGE_FILES=$(find src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.css" | xargs ls -la | awk '$5 > 1048576 {print $9, $5}' 2>/dev/null || true)

if [ ! -z "$LARGE_FILES" ]; then
    echo "${YELLOW}⚠️  다음 파일들이 1MB보다 큽니다:${NC}"
    echo "$LARGE_FILES"
    echo "${YELLOW}💡 파일 분할을 고려하세요${NC}"
else
    echo "${GREEN}✅ 큰 파일 없음${NC}"
fi

# 6. 금지된 라이브러리 검사
echo "${BLUE}6. 금지된 라이브러리 검사 중...${NC}"
FORBIDDEN_IMPORTS=$(grep -r "import.*moment\|import.*lodash" src/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)

if [ ! -z "$FORBIDDEN_IMPORTS" ]; then
    echo "${RED}❌ 금지된 라이브러리 사용 발견:${NC}"
    echo "$FORBIDDEN_IMPORTS"
    echo "${YELLOW}💡 moment → date-fns, lodash → 네이티브 함수 사용을 권장합니다${NC}"
    EXIT_CODE=1
else
    echo "${GREEN}✅ 금지된 라이브러리 없음${NC}"
fi

# 7. 민감한 정보 검사
echo "${BLUE}7. 민감한 정보 검사 중...${NC}"
SENSITIVE_DATA=$(grep -ri "password\|secret\|api_key\|private_key" src/ --include="*.tsx" --include="*.ts" | grep -v "placeholder\|example\|dummy" | head -5 2>/dev/null || true)

if [ ! -z "$SENSITIVE_DATA" ]; then
    echo "${RED}❌ 민감한 정보가 포함될 수 있는 코드 발견:${NC}"
    echo "$SENSITIVE_DATA"
    echo "${YELLOW}💡 민감한 정보는 환경변수나 설정 파일을 사용하세요${NC}"
    EXIT_CODE=1
else
    echo "${GREEN}✅ 민감한 정보 없음${NC}"
fi

# 8. Git 커밋 메시지 검사 (최근 커밋)
echo "${BLUE}8. 커밋 메시지 검사 중...${NC}"
LAST_COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "")

if [ ${#LAST_COMMIT_MSG} -lt 10 ]; then
    echo "${YELLOW}⚠️  커밋 메시지가 너무 짧습니다: '$LAST_COMMIT_MSG'${NC}"
    echo "${YELLOW}💡 명확한 커밋 메시지를 작성하세요${NC}"
elif [[ "$LAST_COMMIT_MSG" =~ ^(feat|fix|docs|style|refactor|test|chore): ]]; then
    echo "${GREEN}✅ 커밋 메시지 형식 준수${NC}"
else
    echo "${YELLOW}⚠️  Conventional Commits 형식을 권장합니다${NC}"
    echo "${YELLOW}💡 예: 'feat: 새로운 기능 추가', 'fix: 버그 수정'${NC}"
fi

# 결과 출력
echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "${GREEN}🎉 모든 검사 통과! 커밋 준비 완료${NC}"
    echo "${BLUE}📋 권장 다음 단계:${NC}"
    echo "   1. git add ."
    echo "   2. git commit -m 'your message'"
else
    echo "${RED}❌ 일부 검사에서 문제 발견${NC}"
    echo "${YELLOW}💡 위의 문제들을 수정한 후 다시 시도하세요${NC}"
    echo ""
    echo "${BLUE}🔧 자동 수정 옵션:${NC}"
    echo "   - ./scripts/resolve-conflicts.sh  (merge conflict 해결)"
    echo "   - npm run lint -- --fix          (ESLint 자동 수정)"
    echo "   - npm run format                 (Prettier 포맷팅)"
fi

exit $EXIT_CODE 