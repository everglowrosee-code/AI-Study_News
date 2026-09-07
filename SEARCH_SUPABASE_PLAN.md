# 네이버 뉴스 검색 결과 Supabase 저장 및 관리 개발 계획서

본 문서는 `@SUPABASE_SCHEMA.md`에 정의된 데이터베이스 스키마를 100% 준수하면서, 검색 히스토리 관리, 개별 기사 삭제, 검색어 삭제 시 연관 기사 삭제 여부 선택, 그리고 영구 저장 기능을 완벽하게 구현하기 위한 상세 개발 계획입니다.

---

## 1. 요구사항 분석 및 해결 전략

| 요구사항 | 구현 방식 및 해결 전략 |
| :--- | :--- |
| **1. 테이블 스키마 준수** | `SUPABASE_SCHEMA.md`에 명시된 `search_history`, `news_items`, 인덱스, 트리거(`clean_old_search_history`), 뷰(`v_search_history`), RLS 정책을 변경 없이 그대로 적용 |
| **2. 검색일자 포함 히스토리 반환** | `created_at` 필드를 포맷팅(예: `2026-09-07 08:30`, `5분 전` 등)하여 키워드, 결과 건수와 함께 클라이언트에 전달 |
| **3. 검색어 삭제 시 연관 기사 삭제 여부 확인** | 히스토리 삭제 시 전용 확인 다이얼로그를 띄워 **"연결된 모든 검색결과 리스트도 함께 삭제하시겠습니까?"**를 사용자에게 선택하도록 구현 |
| **4. 개별 기사별 삭제 기능** | 저장된 기사 목록에서 각 기사별 [삭제] 버튼을 제공하고, `news_items` 테이블에서 해당 기사 ID(`uuid`) 단독 삭제 API 제공 |
| **5. 영구 저장 기능 (검색어 삭제 시에도 보존)** | `search_history` 삭제 시 CASCADE에 의해 `news_items`가 삭제되더라도 영향을 받지 않는 독립 영구 보관 테이블(`permanent_news`)을 구축하여 완벽한 데이터 보존 보장 |

---

## 2. 데이터베이스 구조 설계

### (1) `SUPABASE_SCHEMA.md` 준수 테이블
- **`search_history`**: 검색 키워드, 총 결과 건수, 시작 위치, 출력 개수, lastBuildDate, 검색 수행 일시(`created_at`)
- **`news_items`**: `search_id` (FK, `ON DELETE CASCADE`), 원본/정제 제목, 원본/네이버 링크, 원본/정제 요약, 발행일(`pub_date`), 언론사(`press`), 저장일시(`created_at`)
- **자동 정리 트리거**: 최근 10개 검색만 유지 (10개 초과 시 오래된 검색 자동 삭제 및 연관 기사 자동 CASCADE)

### (2) 영구 저장 전용 테이블 (`permanent_news`)
검색어가 삭제되거나 10개 제한 트리거로 인해 `news_items`가 CASCADE 삭제되더라도 **영구 저장 기사가 절대 삭제되지 않도록** 보장하는 독립 테이블입니다.
```sql
CREATE TABLE IF NOT EXISTS permanent_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_news_id UUID,                         -- 기존 news_items의 id 참조 (선택)
  title TEXT NOT NULL,                           -- 기사 제목 (네이버 원본)
  clean_title TEXT NOT NULL,                     -- HTML 정제 제목
  originallink TEXT,                             -- 언론사 원문 URL
  link TEXT NOT NULL,                            -- 네이버 뉴스 URL
  description TEXT,                              -- 요약문
  clean_description TEXT,                        -- HTML 정제 요약문
  pub_date TIMESTAMPTZ,                          -- 기사 발행 일시
  press TEXT DEFAULT '네이버뉴스',               -- 언론사명
  saved_at TIMESTAMPTZ DEFAULT now() NOT NULL    -- 영구 저장 일시
);
```

---

## 3. 백엔드 API 엔드포인트 설계

1. **`GET /api/history`**:
   - 최근 검색 히스토리 목록 조회 (검색일자 `created_at`, `keyword`, `total`, 연결된 기사 개수 반환)
2. **`DELETE /api/history`**:
   - 검색 히스토리 삭제 엔드포인트
   - Query / Body: `{ id: string, deleteRelatedItems: boolean }`
   - `deleteRelatedItems === true`: `search_history` 행 삭제 (CASCADE로 해당 `news_items` 전체 함께 삭제)
   - `deleteRelatedItems === false`: 기사는 유지하고 검색 이력 참조만 해제하거나 알림 처리
3. **`GET /api/news-items`**:
   - 저장된 기사 목록 조회 (전체 또는 특정 `search_id` 필터링)
4. **`DELETE /api/news-items?id=...`**:
   - `news_items` 테이블에서 특정 기사 1건을 단독 삭제
5. **`GET /api/permanent-news` & `POST /api/permanent-news` & `DELETE /api/permanent-news`**:
   - 영구 저장 기사 목록 조회, 영구 저장 등록, 영구 저장 해제(삭제)

---

## 4. 프론트엔드 UI 화면 구성

### 1) 상단 네비게이션 탭 확장
- **[실시간 뉴스 검색]**: 네이버 API 실시간 검색 및 자동 DB 저장
- **[검색 히스토리]**: 검색일자와 함께 최근 10개 검색 기록 카드/테이블 뷰
- **[저장된 기사 리스트]**: 수파베이스에 저장된 기사 목록 및 개별 삭제 인터페이스
- **[⭐ 영구 보관함]**: 검색어가 삭제되어도 영구 보존되는 스크랩 기사 목록

### 2) 검색 히스토리 삭제 확인 모달 (Confirmation Dialog)
사용자가 히스토리 항목의 [삭제] 버튼을 누를 때 팝업:
> **검색 히스토리 삭제 확인**
> - 삭제 대상: `"{keyword}"` (검색일시: 2026-09-07 08:30)
> - **"해당 검색어와 연결된 모든 검색결과 기사(N건)도 함께 삭제하시겠습니까?"**
>   - 🔘 **[연관 기사까지 모두 삭제]** : 검색어와 연관 기사 일괄 삭제 (영구 저장 기사는 안전하게 보존됨)
>   - 🔘 **[취소]**

### 3) 저장된 기사 카드 및 개별 삭제 인터페이스
- 각 기사 카드에 **[개별 삭제]** 버튼 (클릭 시 확인 토스트와 함께 DB에서 해당 기사만 즉시 제거)
- 각 기사 카드에 **[⭐ 영구 저장]** 토글 버튼 (클릭 시 `permanent_news` 테이블에 저장되어 영구 보존 상태 뱃지 표시)

---

## 5. 단계별 구현 로드맵

1. **1단계: 데이터베이스 스키마 구성**
   - `supabase/schema.sql`에 `permanent_news` 테이블 정의 추가
   - Supabase SQL Editor 실행 가이드 제공
2. **2단계: 백엔드 API 라우트 개발**
   - `/api/history` (조회 및 연관 기사 삭제 옵션 지원 DELETE)
   - `/api/news-items` (저장된 기사 조회 및 개별 DELETE)
   - `/api/permanent-news` (영구 저장 CRUD)
3. **3단계: 대시보드 UI 컴포넌트 개발**
   - `HistoryManagerModal` (검색일자 표시 및 연관 기사 삭제 확인 다이얼로그)
   - `SavedNewsView` (저장된 기사 리스트 보기 및 개별 기사 삭제)
   - `PermanentNewsView` (영구 저장 기사 모아보기 및 관리)
4. **4단계: 테스트 및 검증**
   - 검색어 삭제 시 연관 기사 삭제/보존 동작 검증
   - 검색어 삭제 후에도 영구 저장 기사가 그대로 남아있는지 검증
   - 개별 기사 삭제 동작 검증
   - TypeScript 빌드 검증 (`npm run build`) 및 Git 커밋/푸시
