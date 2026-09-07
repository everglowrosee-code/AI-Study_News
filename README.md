# 📰 news-capt (네이버 뉴스 검색 & 인사이트 대시보드)

네이버 검색 OpenAPI를 활용하여 실시간 뉴스 검색, 언론사별 분포 분석, 기사 스크랩 및 키워드 모니터링을 제공하는 모던 대시보드 웹 애플리케이션입니다.

---

## ✨ 주요 기능

- 🔍 **실시간 뉴스 검색**: 키워드 기반 실시간 뉴스 검색, 자동 완성 및 트렌드 키워드 태그
- 📊 **대시보드 메트릭 & 언론사 통계**: 총 검색 건수 카운트 및 상위 언론사 분포 실시간 도메인 분석 (클릭 시 언론사 필터링)
- 📑 **카드 & 리스트 뷰 전환**: 취향에 맞게 카드 그리드 또는 리스트 형태로 뉴스 탐색
- 📌 **스크랩(북마크) 보관함**: 관심 있는 기사를 로컬에 영구 보관하고 별도 탭에서 모아보기
- 🔐 **네이버 API 설정 모달**: 대시보드 상에서 간편하게 네이버 Client ID / Secret 입력 및 전환
- 🧪 **스마트 데모 모드 (Fallback)**: API 키가 없어도 모든 기능을 체험할 수 있는 지능형 목데이터 엔진 내장
- 🌓 **다크 / 라이트 모드**: 글래스모피즘 기반의 세련된 모던 UI (shadcn UI + Tailwind CSS v4)

---

## 🛠 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn UI (Radix UI 기반)
- **Icons**: Lucide React
- **API**: Naver Search OpenAPI (뉴스 검색)

---

## 🚀 로컬 실행 방법

1. **저장소 클론 및 패키지 설치**:
   ```bash
   git clone https://github.com/everglowrosee-code/AI-Study_News.git
   cd AI-Study_News
   npm install
   ```

2. **환경변수 설정 (선택 사항)**:
   `.env.example`을 복사하여 `.env.local` 파일을 생성하고 네이버 개발자 센터에서 발급받은 키를 입력합니다.
   *(키를 등록하지 않아도 스마트 데모 모드로 바로 작동합니다)*
   ```env
   NAVER_CLIENT_ID=your_client_id_here
   NAVER_CLIENT_SECRET=your_client_secret_here
   ```

3. **개발 서버 실행**:
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000` 접속

---

## 🌐 Vercel 배포 시 환경변수 설정

1. [Vercel](https://vercel.com)에 로그인 후 **`Add New...` > `Project`**를 클릭하여 이 GitHub 저장소를 Import합니다.
2. 배포 설정 화면의 **`Environment Variables`** 섹션에서 다음 두 변수를 추가합니다:
   - **Key**: `NAVER_CLIENT_ID` / **Value**: 발급받은 네이버 Client ID
   - **Key**: `NAVER_CLIENT_SECRET` / **Value**: 발급받은 네이버 Client Secret
3. **`Deploy`** 버튼을 클릭하면 실시간 네이버 뉴스 연동이 포함된 상태로 자동 배포됩니다.
# 네이버 기사 본문 저장

검색 결과의 개별 네이버 기사 본문을 Supabase에 저장하려면 먼저 Supabase SQL Editor에서
`supabase/add_article_content.sql`을 한 번 실행합니다.

그다음 저장된 기사의 `id`와 개별 기사 URL을 `/api/crawl`에 전달합니다.

```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"newsItemId":"news_items UUID","naverLink":"https://n.news.naver.com/mnews/article/032/ARTICLE_ID"}'
```

`https://media.naver.com/press/032`는 경향신문 언론사 홈이므로 본문 수집 대상이 아닙니다.
반드시 `/article/032/...` 형식의 개별 기사 주소를 사용해야 합니다. 성공하면 정제된 본문은
`news_items.content`, 수집 시각은 `news_items.content_crawled_at`에 저장됩니다.
