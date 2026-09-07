import { NextRequest, NextResponse } from "next/server"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

// GET: 최근 검색 히스토리 10개 조회 (검색일자 포함)
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
          press,
          created_at
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json({
          isConfigured: true,
          history: [],
          tablePending: true,
          message: "search_history 테이블이 아직 생성되지 않았습니다.",
        })
      }
      console.error("Supabase fetch error:", error)
      return NextResponse.json(
        { isConfigured: true, history: [], error: error.message },
        { status: 500 }
      )
    }

    // 프론트엔드 호환 및 정제 (검색일자 created_at 명확히 포함)
    const formattedHistory = (data || []).map((row: any) => ({
      id: row.id,
      keyword: row.keyword,
      total_count: row.total,
      total: row.total,
      startIndex: row.start_index,
      display: row.display,
      lastBuildDate: row.last_build_date,
      created_at: row.created_at, // 검색일자
      itemCount: (row.news_items || []).length,
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
        createdAt: item.created_at,
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

// DELETE: 검색 히스토리 삭제 (연관 기사 삭제 여부 분기)
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const deleteRelatedItems = searchParams.get("deleteRelatedItems") !== "false" // 기본 true

  if (!id) {
    return NextResponse.json(
      { error: "삭제할 search_history ID가 필요합니다." },
      { status: 400 }
    )
  }

  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 클라이언트 오류" }, { status: 500 })
    }

    // 만약 "연관 기사는 유지"를 선택한 경우 (deleteRelatedItems === false)
    // news_items의 기사들을 permanent_news로 승격 저장하여 영구 보존함
    if (!deleteRelatedItems) {
      const { data: relatedItems } = await supabase
        .from("news_items")
        .select("*")
        .eq("search_id", id)

      if (relatedItems && relatedItems.length > 0) {
        const permanentRows = relatedItems.map((item) => ({
          original_news_id: item.id,
          title: item.title,
          clean_title: item.clean_title,
          originallink: item.originallink,
          link: item.link,
          description: item.description,
          clean_description: item.clean_description,
          pub_date: item.pub_date,
          press: item.press,
        }))
        // permanent_news에 일괄 저장
        await supabase.from("permanent_news").upsert(permanentRows, { onConflict: "link", ignoreDuplicates: true })
      }
    }

    // search_history 삭제 (CASCADE에 의해 news_items도 함께 삭제됨, permanent_news는 보존)
    const { error: deleteError } = await supabase
      .from("search_history")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete history error:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: deleteRelatedItems
        ? "검색 히스토리 및 연관 기사가 삭제되었습니다."
        : "검색 히스토리는 삭제되었으며, 연관 기사는 영구 보관함으로 보존되었습니다.",
      deleteRelatedItems,
    })
  } catch (error: unknown) {
    console.error("Delete history API error:", error)
    return NextResponse.json(
      { error: "검색 히스토리 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
