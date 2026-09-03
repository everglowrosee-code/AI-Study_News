import { NextRequest, NextResponse } from "next/server"

// 언론사 도메인 매핑 테이블
const PRESS_DOMAINS: Record<string, string> = {
  "yna.co.kr": "연합뉴스",
  "yonhapnewstv.co.kr": "연합뉴스TV",
  "chosun.com": "조선일보",
  "joongang.co.kr": "중앙일보",
  "donga.com": "동아일보",
  "hani.co.kr": "한겨레",
  "khan.co.kr": "경향신문",
  "mk.co.kr": "매일경제",
  "hankyung.com": "한국경제",
  "sedaily.com": "서울경제",
  "etnews.com": "전자신문",
  "zdnet.co.kr": "지디넷코리아",
  "bloter.net": "블로터",
  "digitaltoday.co.kr": "디지털투데이",
  "news1.kr": "뉴스1",
  "newsis.com": "뉴시스",
  "ytn.co.kr": "YTN",
  "sbs.co.kr": "SBS",
  "kbs.co.kr": "KBS",
  "mbc.co.kr": "MBC",
  "jtbc.co.kr": "JTBC",
  "moneys.co.kr": "머니S",
  "mt.co.kr": "머니투데이",
  "edaily.co.kr": "이데일리",
  "heraldcorp.com": "헤럴드경제",
  "inews24.com": "아이뉴스24",
  "asiae.co.kr": "아시아경제",
  "fnnews.com": "파이낸셜뉴스",
  "techm.kr": "테크M",
}

function extractPress(originalLink: string, link: string): string {
  try {
    const targetUrl = originalLink || link
    if (!targetUrl) return "주요언론"
    const parsed = new URL(targetUrl)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "")

    for (const [domain, name] of Object.entries(PRESS_DOMAINS)) {
      if (host.includes(domain)) {
        return name
      }
    }
    // 기본 파싱
    const parts = host.split(".")
    if (parts.length >= 2) {
      return parts[parts.length - 2].toUpperCase()
    }
    return "네이버뉴스"
  } catch {
    return "네이버뉴스"
  }
}

function cleanHtml(html: string): string {
  if (!html) return ""
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&middot;/g, "·")
    .replace(/&#39;/g, "'")
}

// 스마트 Mock 데이터 생성기 (키가 없거나 개발용)
function generateMockNews(query: string, count: number, sort: string) {
  const pressList = [
    "연합뉴스", "전자신문", "매일경제", "한국경제", "조선일보", 
    "지디넷코리아", "디지털투데이", "블로터", "서울경제", "테크M"
  ]

  const templates = [
    {
      titleTemplate: `"{query}" 기술 혁신 가속화… 글로벌 시장 주도권 경쟁 본격화`,
      descTemplate: `최근 국내외 주요 기업들이 {query} 분야 연구개발(R&D) 투자를 대폭 확대하며 차세대 기술 표준 선점에 나서고 있다. 산업 전문가들은 실용화 속도가 예상보다 빨라질 것으로 내다봤다.`
    },
    {
      titleTemplate: `정부, {query} 생태계 육성에 대규모 정책 금융 및 인프라 지원 발표`,
      descTemplate: `정부 부처 합동으로 발표된 이번 육성안에 따르면 {query} 관련 유망 스타트업 육성과 핵심 인재 양성을 위한 펀드가 신규 조성된다.`
    },
    {
      titleTemplate: `[심층 리포트] 2026년 {query} 트렌드 분석: 어디까지 진화했나`,
      descTemplate: `{query} 기술의 실제 현장 적용 사례가 급증하는 가운데, 보안 및 윤리적 가이드라인에 대한 논의도 활발해지고 있다. 글로벌 주요 컨퍼런스 핵심 의제를 짚어본다.`
    },
    {
      titleTemplate: `빅테크, {query} 기반 신규 서비스 전격 공개… 사용자 반응 '후끈'`,
      descTemplate: `새롭게 출시된 {query} 연계 플랫폼은 직관적인 인터페이스와 고도화된 처리 속도로 오픈 첫날부터 높은 트래픽을 기록했다.`
    },
    {
      titleTemplate: `{query} 스타트업, 글로벌 벤처캐피털로부터 대규모 시리즈 투자 유치`,
      descTemplate: `독자적인 기술력을 인정받은 유망 기업이 글로벌 시장 확장을 위한 실탄을 확보하며 본격적인 해외 진출 로드맵을 가동한다.`
    },
    {
      titleTemplate: `산업 전반으로 확산되는 {query}… 업무 생산성 40% 이상 개선 효과`,
      descTemplate: `제조, 금융, 물류 등 전통 산업군에서 {query} 도입을 통한 효율화 성공 사례가 잇따라 보고되며 디지털 전환(DX)의 핵심 축으로 부상하고 있다.`
    }
  ]

  const items = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const press = pressList[i % pressList.length]
    const template = templates[i % templates.length]
    const minutesAgo = sort === "date" ? i * 15 + Math.floor(Math.random() * 10) : i * 60 + Math.floor(Math.random() * 180)
    const pubDate = new Date(now - minutesAgo * 60 * 1000).toUTCString()
    const title = template.titleTemplate.replace(/\{query\}/g, query)
    const description = template.descTemplate.replace(/\{query\}/g, query)

    items.push({
      title: `<b>${query}</b> 관련: ${title}`,
      cleanTitle: title,
      originallink: `https://example.com/news/${i + 1}`,
      link: `https://n.news.naver.com/mnews/article/001/001${String(i).padStart(7, "0")}`,
      description: `<b>${query}</b> 분야의 최신 소식. ${description}`,
      cleanDescription: description,
      pubDate,
      press,
    })
  }

  return {
    lastBuildDate: new Date().toUTCString(),
    total: 12480,
    start: 1,
    display: count,
    items,
    isMock: true,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || "인공지능"
  const display = Math.min(Math.max(Number(searchParams.get("display")) || 20, 10), 100)
  const start = Math.min(Math.max(Number(searchParams.get("start")) || 1, 1), 1000)
  const sort = searchParams.get("sort") === "date" ? "date" : "sim"

  // 1. 헤더 혹은 환경변수에서 Client ID, Secret 획득
  const headerClientId = request.headers.get("x-naver-client-id")
  const headerClientSecret = request.headers.get("x-naver-client-secret")
  
  const clientId = headerClientId || process.env.NAVER_CLIENT_ID
  const clientSecret = headerClientSecret || process.env.NAVER_CLIENT_SECRET

  // 2. 키가 없는 경우 Mock 데이터 반환
  if (!clientId || !clientSecret) {
    const mockData = generateMockNews(query, display, sort)
    return NextResponse.json(mockData)
  }

  // 3. 네이버 뉴스 검색 API 호출
  try {
    const naverApiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(
      query
    )}&display=${display}&start=${start}&sort=${sort}`

    const response = await fetch(naverApiUrl, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 30 }, // 30초 캐싱
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn("Naver API error, falling back to mock:", response.status, errText)
      // 인증 오류(401, 403) 시에도 Mock으로 폴백하여 대시보드 중단 방지
      const mockData = generateMockNews(query, display, sort)
      return NextResponse.json({
        ...mockData,
        apiError: `Naver API [${response.status}]: ${response.statusText}`,
      })
    }

    const data = await response.json()

    // 4. 응답 아이템 정제 및 언론사 도메인 파싱
    const refinedItems = (data.items || []).map((item: {
      title: string
      originallink: string
      link: string
      description: string
      pubDate: string
    }) => {
      const press = extractPress(item.originallink, item.link)
      return {
        ...item,
        cleanTitle: cleanHtml(item.title),
        cleanDescription: cleanHtml(item.description),
        press,
      }
    })

    return NextResponse.json({
      lastBuildDate: data.lastBuildDate,
      total: data.total,
      start: data.start,
      display: data.display,
      items: refinedItems,
      isMock: false,
    })
  } catch (error) {
    console.error("API error:", error)
    // 네트워크 오류 시 Mock 반환
    const mockData = generateMockNews(query, display, sort)
    return NextResponse.json({
      ...mockData,
      apiError: "네트워크 통신 중 오류가 발생하여 샘플 데이터를 표시합니다.",
    })
  }
}
