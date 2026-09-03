-- ====================================================================
-- news-capt: 네이버 뉴스 검색 결과 Supabase 스키마 (최근 10개 자동 유지)
-- ====================================================================

-- 1. 검색 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,                         -- 검색 키워드
  total_count INTEGER DEFAULT 0,                 -- 총 검색 결과 수
  results JSONB NOT NULL,                        -- 네이버 뉴스 반환 JSON 데이터
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL  -- 검색 일시
);

-- 2. 최신순 조회를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_search_history_created_at 
ON search_history (created_at DESC);

-- 3. 최근 10개만 유지하는 자동 정리 트리거 함수 생성
CREATE OR REPLACE FUNCTION clean_old_search_history()
RETURNS TRIGGER AS $$
BEGIN
  -- 가장 최근 10개의 id를 제외한 나머지 오래된 레코드를 자동 삭제
  DELETE FROM search_history
  WHERE id NOT IN (
    SELECT id FROM search_history
    ORDER BY created_at DESC
    LIMIT 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. INSERT 발생 시 트리거 실행 연결
DROP TRIGGER IF EXISTS trg_clean_old_search_history ON search_history;
CREATE TRIGGER trg_clean_old_search_history
AFTER INSERT ON search_history
FOR EACH STATEMENT
EXECUTE FUNCTION clean_old_search_history();

-- 5. RLS (Row Level Security) 설정 및 공개 읽기/쓰기 허용
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read and insert" ON search_history;
CREATE POLICY "Allow public read and insert" 
ON search_history 
FOR ALL 
USING (true) 
WITH CHECK (true);
