import { NextResponse } from "next/server"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      isConfigured: false,
      history: [],
      message: "Supabase 환경변수가 설정되지 않았습니다.",
    })
  }

  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ isConfigured: false, history: [] })
    }

    // search_history와 연관된 news_items 조인 조회 (최근 10개)
    const { data, error } = await supabase
      .from("search_history")
      .select(`
        id,
        keyword,
        total,
        start_index,
        display,
        last_build_date,
        created_at,
        news_items (
          id,
          title,
          clean_title,
          originallink,
          link,
          description,
          clean_description,
          pub_date,
          press
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json(
        { isConfigured: true, history: [], error: error.message },
        { status: 500 }
      )
    }

    // 프론트엔드 호환 및 정제
    const formattedHistory = (data || []).map((row: any) => ({
      id: row.id,
      keyword: row.keyword,
      total_count: row.total,
      total: row.total,
      startIndex: row.start_index,
      display: row.display,
      lastBuildDate: row.last_build_date,
      created_at: row.created_at,
      items: (row.news_items || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        cleanTitle: item.clean_title,
        originallink: item.originallink,
        link: item.link,
        description: item.description,
        cleanDescription: item.clean_description,
        pubDate: item.pub_date,
        press: item.press,
      })),
    }))

    return NextResponse.json({
      isConfigured: true,
      history: formattedHistory,
    })
  } catch (error: unknown) {
    console.error("History API error:", error)
    return NextResponse.json(
      { isConfigured: true, history: [], error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
