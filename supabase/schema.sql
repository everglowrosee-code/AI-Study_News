-- ====================================================================
-- news-capt: 네이버 뉴스 검색 결과 정규화 스키마 (네이버 공식 API 규격 1:1 매핑)
-- ====================================================================

-- 기존 테이블 및 뷰 정리 (필요시)
DROP VIEW IF EXISTS v_search_history;
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;

-- 1. 검색 마스터 테이블 (네이버 API Root 응답 매핑)
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,                         -- 검색 키워드 (query)
  total INTEGER DEFAULT 0 NOT NULL,              -- 전체 검색 결과 개수 (total)
  start_index INTEGER DEFAULT 1 NOT NULL,        -- 검색 시작 위치 (start)
  display INTEGER DEFAULT 20 NOT NULL,           -- 한 번에 표시된 개수 (display)
  last_build_date TIMESTAMPTZ,                   -- 검색 결과 생성 시간 (lastBuildDate)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL  -- 검색 수행 일시
);

-- 2. 뉴스 개별 기사 테이블 (네이버 API items 배열 1:1 필드 매핑)
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES search_history(id) ON DELETE CASCADE, -- 부모 검색 외래키
  title TEXT NOT NULL,                           -- 기사 제목 (네이버 원본, <b> 태그 포함)
  clean_title TEXT NOT NULL,                     -- HTML 태그가 정제된 순수 제목
  originallink TEXT,                             -- 언론사 원문 URL (originallink)
  link TEXT NOT NULL,                            -- 네이버 뉴스 URL (link)
  description TEXT,                              -- 기사 내용 요약 (네이버 원본, <b> 태그 포함)
  clean_description TEXT,                        -- HTML 태그가 정제된 순수 내용 요약
  pub_date TIMESTAMPTZ,                          -- 기사 발행 일시 (pubDate, RFC 822 파싱)
  press TEXT DEFAULT '네이버뉴스',               -- URL 도메인 기반 언론사명 (예: 조선일보, 연합뉴스)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL  -- 저장 일시
);

-- 3. 고성능 조회를 위한 인덱스 생성
CREATE INDEX idx_search_history_created_at ON search_history (created_at DESC);
CREATE INDEX idx_news_items_search_id ON news_items (search_id);
CREATE INDEX idx_news_items_press ON news_items (press);
CREATE INDEX idx_news_items_pub_date ON news_items (pub_date DESC);

-- 4. 최근 10개 검색만 유지하는 자동 정리 트리거 함수
-- (search_history에서 10개 초과 삭제 시, ON DELETE CASCADE로 news_items도 자동 삭제됨)
CREATE OR REPLACE FUNCTION clean_old_search_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM search_history
  WHERE id NOT IN (
    SELECT id FROM search_history
    ORDER BY created_at DESC
    LIMIT 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 등록
CREATE TRIGGER trg_clean_old_search_history
AFTER INSERT ON search_history
FOR EACH STATEMENT
EXECUTE FUNCTION clean_old_search_history();

-- 6. 조회 편의를 위한 뷰 (View) 생성: 검색 정보 + 뉴스 items JSON 배열 결합
CREATE OR REPLACE VIEW v_search_history AS
SELECT 
  s.id,
  s.keyword,
  s.total,
  s.start_index,
  s.display,
  s.last_build_date,
  s.created_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', n.id,
        'title', n.title,
        'cleanTitle', n.clean_title,
        'originallink', n.originallink,
        'link', n.link,
        'description', n.description,
        'cleanDescription', n.clean_description,
        'pubDate', n.pub_date,
        'press', n.press
      ) ORDER BY n.created_at ASC
    ) FILTER (WHERE n.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM search_history s
LEFT JOIN news_items n ON s.id = n.search_id
GROUP BY s.id;

-- 7. Row Level Security (RLS) 보안 정책
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and insert search_history" 
ON search_history FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read and insert news_items" 
ON news_items FOR ALL USING (true) WITH CHECK (true);
