import { NextRequest, NextResponse } from "next/server"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

// GET: 영구 저장된 기사 목록 조회
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      isConfigured: false,
      items: [],
      message: "Supabase가 설정되지 않았습니다.",
    })
  }

  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ items: [] })
    }

    const { data, error } = await supabase
      .from("permanent_news")
      .select("*")
      .order("saved_at", { ascending: false })

    if (error) {
      console.error("Fetch permanent news error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (data || []).map((row: any) => ({
      id: row.id,
      originalNewsId: row.original_news_id,
      title: row.title,
      cleanTitle: row.clean_title,
      originallink: row.originallink,
      link: row.link,
      description: row.description,
      cleanDescription: row.clean_description,
      pubDate: row.pub_date,
      press: row.press,
      savedAt: row.saved_at,
      isPermanent: true,
    }))

    return NextResponse.json({
      isConfigured: true,
      items,
      count: items.length,
    })
  } catch (error: unknown) {
    console.error("Permanent news API error:", error)
    return NextResponse.json(
      { error: "영구 저장 기사 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// POST: 기사를 영구 저장소에 추가
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const {
      originalNewsId,
      title,
      cleanTitle,
      originallink,
      link,
      description,
      cleanDescription,
      pubDate,
      press,
    } = body

    if (!title || !link) {
      return NextResponse.json(
        { error: "기사 제목과 링크는 필수 항목입니다." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 클라이언트 오류" }, { status: 500 })
    }

    // 중복 저장 방지 확인
    const { data: existing } = await supabase
      .from("permanent_news")
      .select("id")
      .eq("link", link)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "이미 영구 저장소에 보관된 기사입니다.",
        id: existing.id,
      })
    }

    const { data, error } = await supabase
      .from("permanent_news")
      .insert({
        original_news_id: originalNewsId || null,
        title,
        clean_title: cleanTitle || title,
        originallink: originallink || link,
        link,
        description: description || "",
        clean_description: cleanDescription || description || "",
        pub_date: pubDate ? new Date(pubDate).toISOString() : null,
        press: press || "네이버뉴스",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Insert permanent news error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "기사가 영구 저장소에 보관되었습니다.",
      id: data.id,
    })
  } catch (error: unknown) {
    console.error("Save permanent news error:", error)
    return NextResponse.json(
      { error: "영구 저장 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// DELETE: 영구 저장소에서 특정 기사 제거
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase가 설정되지 않았습니다." },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const link = searchParams.get("link")

  if (!id && !link) {
    return NextResponse.json(
      { error: "삭제할 ID 또는 Link가 필요합니다." },
      { status: 400 }
    )
  }

  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase 클라이언트 오류" }, { status: 500 })
    }

    let query = supabase.from("permanent_news").delete()
    if (id) {
      query = query.eq("id", id)
    } else if (link) {
      query = query.eq("link", link)
    }

    const { error: deleteError } = await query

    if (deleteError) {
      console.error("Delete permanent news error:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "영구 저장소에서 삭제되었습니다.",
    })
  } catch (error: unknown) {
    console.error("Delete permanent news API error:", error)
    return NextResponse.json(
      { error: "영구 저장 기사 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
