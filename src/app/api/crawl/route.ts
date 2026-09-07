import { load } from "cheerio"
import { NextRequest, NextResponse } from "next/server"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

export const runtime = "nodejs"

const ARTICLE_PATH = /^\/(?:mnews\/)?article\/\d{3}\/\d+\/?$/
const ALLOWED_HOSTS = new Set(["n.news.naver.com", "news.naver.com"])

function crawlFailure(error: string) {
  return NextResponse.json({ content: null, error })
}

function parseNaverArticleUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) return null
    return ARTICLE_PATH.test(url.pathname) ? url : null
  } catch {
    return null
  }
}

function normalizeArticleText(raw: string): string {
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function extractArticle(html: string) {
  const $ = load(html)
  const article = $("#dic_area, #newsct_article").first().clone()
  article
    .find("script, style, iframe, button, .media_end_head_autosummary, .byline, .copyright, .reporter_area")
    .remove()
  article.find("br").replaceWith("\n")
  article.find("p, div").each((_, element) => void $(element).append("\n"))

  return {
    title: normalizeArticleText(
      $("#title_area, h2.media_end_head_headline, .media_end_head_title").first().text()
    ),
    content: normalizeArticleText(article.text()),
  }
}

export async function POST(request: NextRequest) {
  let body: { newsItemId?: unknown; naverLink?: unknown }
  try {
    body = await request.json()
  } catch {
    return crawlFailure("올바른 JSON 요청이 필요합니다.")
  }

  const articleUrl = parseNaverArticleUrl(body.naverLink)
  const newsItemId = typeof body.newsItemId === "string" ? body.newsItemId.trim() : ""
  if (!articleUrl) {
    return crawlFailure(
      "네이버 개별 기사 주소가 필요합니다. 언론사 홈이 아니라 n.news.naver.com/.../article/... 형식을 사용해 주세요."
    )
  }

  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      return crawlFailure(`네이버 기사 요청에 실패했습니다. (${response.status})`)
    }
    if (!(response.headers.get("content-type") || "").includes("text/html")) {
      return crawlFailure("기사 HTML 응답을 받지 못했습니다.")
    }

    const { content } = extractArticle(await response.text())
    if (content.length < 30) {
      return crawlFailure("기사 본문을 찾지 못했습니다. 네이버 페이지 구조가 변경됐을 수 있습니다.")
    }

    // 뉴스 저장 직전 호출될 때는 본문만 반환한다.
    // newsItemId가 전달된 경우에만 기존 DB 행도 갱신한다.
    if (!newsItemId || !isSupabaseConfigured) return NextResponse.json({ content })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ content })

    let updateQuery = supabase
      .from("news_items")
      .update({ content, content_crawled_at: new Date().toISOString() })
    updateQuery = newsItemId
      ? updateQuery.eq("id", newsItemId)
      : updateQuery.eq("link", articleUrl.toString())

    const { data, error } = await updateQuery.select("id").maybeSingle()
    if (error) {
      return NextResponse.json({ content, error: `DB 저장 실패: ${error.message}` })
    }
    if (!data) {
      return NextResponse.json(
        { content, error: "본문은 가져왔지만 DB에서 일치하는 기사를 찾지 못했습니다." }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError"
    return crawlFailure(
      isTimeout ? "네이버 기사 요청 시간이 초과되었습니다." : String(error)
    )
  }
}
