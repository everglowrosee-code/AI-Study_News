-- 이미 운영 중인 Supabase 프로젝트에서 한 번 실행하세요.
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content_crawled_at TIMESTAMPTZ;
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS article_content TEXT;

COMMENT ON COLUMN news_items.content IS '네이버 개별 기사 페이지에서 추출한 본문 텍스트';
COMMENT ON COLUMN news_items.content_crawled_at IS '본문을 마지막으로 수집한 시각';
COMMENT ON COLUMN news_items.article_content IS '검색 결과 저장 직전 자동 수집한 네이버 기사 본문';
