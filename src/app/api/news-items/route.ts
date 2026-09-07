import { NextRequest, NextResponse } from "next/server"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

// GET: 저장된 기사 리스트 조회 (search_id 필터 지원)
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      isConfigured: false,
      items: [],
      message: "Supabase가 설정되지 않았습니다.",
    })
  }

  const { searchParams } = new URL(request.url)
  const searchId = searchParams.get("searchId")
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 200)

  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ items: [] })
    }

    let query = supabase
      .from("news_items")
      .select(`
        id,
        search_id,
        title,
        clean_title,
        originallink,
        link,
        description,
        clean_description,
        content,
        content_crawled_at,
        article_content,
        pub_date,
        press,
        created_at,
        search_history (
          keyword
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (searchId) {
      query = query.eq("search_id", searchId)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json({
          isConfigured: true,
          items: [],
          count: 0,
          tablePending: true,
          message: "news_items 테이블이 아직 생성되지 않았습니다.",
        })
      }
      console.error("Fetch news items error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (data || []).map((row: any) => ({
      id: row.id,
      searchId: row.search_id,
      keyword: row.search_history?.keyword || "기타",
      title: row.title,
      cleanTitle: row.clean_title,
      originallink: row.originallink,
      link: row.link,
      description: row.description,
      cleanDescription: row.clean_description,
      content: row.content,
      contentCrawledAt: row.content_crawled_at,
      articleContent: row.article_content,
      pubDate: row.pub_date,
      press: row.press,
      createdAt: row.created_at,
    }))

    return NextResponse.json({
      isConfigured: true,
      items,
      count: items.length,
    })
  } catch (error: unknown) {
    console.error("News items API error:", error)
    return NextResponse.json(
      { error: "저장된 기사 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// DELETE: 개별 기사 단독 삭제
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { error: "삭제할 기사 ID가 필요합니다." },
      { status: 400 }
    )
  }

  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 클라이언트 오류" }, { status: 500 })
    }

    const { error: deleteError } = await supabase
      .from("news_items")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete news item error:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "기사가 성공적으로 삭제되었습니다.",
      deletedId: id,
    })
  } catch (error: unknown) {
    console.error("Delete news item API error:", error)
    return NextResponse.json(
      { error: "기사 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
