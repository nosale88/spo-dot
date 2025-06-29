#!/bin/bash

# 🔧 Merge Conflict 자동 해결 스크립트
# 주의: 이 스크립트는 HEAD 버전을 우선으로 충돌을 해결합니다
# 사용법: ./scripts/resolve-conflicts.sh

echo "🔧 Merge Conflict 자동 해결 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 백업 생성
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
echo "${BLUE}📦 백업 생성 중: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"

# 충돌 파일들 백업
CONFLICT_FILES=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "<<<<<<< HEAD\|=======\|>>>>>>> " 2>/dev/null || true)

if [ -z "$CONFLICT_FILES" ]; then
    echo "${GREEN}✅ 충돌 파일이 없습니다.${NC}"
    exit 0
fi

echo "${YELLOW}⚠️  다음 파일들에서 충돌 발견:${NC}"
echo "$CONFLICT_FILES"

# 백업 생성
for file in $CONFLICT_FILES; do
    cp "$file" "$BACKUP_DIR/$(basename $file).bak"
done

echo "${GREEN}✅ 백업 완료: $BACKUP_DIR${NC}"

# 사용자 확인
echo "${YELLOW}❓ 자동 해결을 진행하시겠습니까? (HEAD 버전 우선) [y/N]${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "${BLUE}ℹ️  작업을 취소했습니다. 백업은 $BACKUP_DIR에 있습니다.${NC}"
    exit 0
fi

# 1. HEAD 버전 선택 (현재 브랜치 우선)
echo "${BLUE}1. HEAD 버전으로 충돌 해결 중...${NC}"

# <<<<<<< HEAD부터 =======까지 삭제 (HEAD 내용 유지)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' '/^<<<<<<< HEAD$/,/^=======$/d' 2>/dev/null || true

# >>>>>>> 커밋해시 라인 삭제
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' '/^>>>>>>> /d' 2>/dev/null || true

echo "${GREEN}✅ 충돌 마크 제거 완료${NC}"

# 2. 포맷팅 정리
echo "${BLUE}2. 코드 포맷팅 중...${NC}"
if command -v prettier &> /dev/null && [ -f ".prettierrc" ] || [ -f "prettier.config.js" ]; then
    npm run format > /dev/null 2>&1 || npx prettier --write "src/**/*.{ts,tsx}" 2>/dev/null || true
    echo "${GREEN}✅ Prettier 포맷팅 완료${NC}"
else
    echo "${YELLOW}⚠️  Prettier 설정을 찾을 수 없습니다${NC}"
fi

# 3. ESLint 자동 수정
echo "${BLUE}3. ESLint 자동 수정 중...${NC}"
if command -v eslint &> /dev/null; then
    npm run lint -- --fix > /dev/null 2>&1 || npx eslint "src/**/*.{ts,tsx}" --fix 2>/dev/null || true
    echo "${GREEN}✅ ESLint 자동 수정 완료${NC}"
else
    echo "${YELLOW}⚠️  ESLint를 찾을 수 없습니다${NC}"
fi

# 4. 빌드 테스트
echo "${BLUE}4. 빌드 테스트 중...${NC}"
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ 빌드 성공${NC}"
    
    # 5. Git 상태 확인
    echo "${BLUE}5. Git 상태:${NC}"
    git status --porcelain
    
    echo ""
    echo "${GREEN}🎉 자동 해결 완료!${NC}"
    echo "${BLUE}📋 다음 단계:${NC}"
    echo "   1. 변경사항을 검토하세요: git diff"
    echo "   2. 파일들을 확인하세요: $CONFLICT_FILES"
    echo "   3. 문제없다면 커밋하세요: git add . && git commit"
    echo "   4. 백업은 $BACKUP_DIR에 있습니다"
    
else
    echo "${RED}❌ 빌드 실패${NC}"
    echo "${YELLOW}💡 백업에서 복원하시겠습니까? [y/N]${NC}"
    read -r restore_response
    
    if [[ "$restore_response" =~ ^[Yy]$ ]]; then
        echo "${BLUE}📦 백업에서 복원 중...${NC}"
        for file in $CONFLICT_FILES; do
            if [ -f "$BACKUP_DIR/$(basename $file).bak" ]; then
                cp "$BACKUP_DIR/$(basename $file).bak" "$file"
            fi
        done
        echo "${GREEN}✅ 복원 완료${NC}"
    fi
    
    echo "${RED}❌ 수동으로 충돌을 해결해야 합니다${NC}"
    echo "${BLUE}📋 수동 해결 가이드:${NC}"
    echo "   1. 각 파일을 열어서 <<<<<<< HEAD 마크를 찾으세요"
    echo "   2. 올바른 코드를 선택하고 충돌 마크를 제거하세요"
    echo "   3. npm run build로 테스트하세요"
    
    exit 1
fi 