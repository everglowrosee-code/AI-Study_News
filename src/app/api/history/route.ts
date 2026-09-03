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

    const { data, error } = await supabase
      .from("search_history")
      .select("id, keyword, total_count, results, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json(
        { isConfigured: true, history: [], error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isConfigured: true,
      history: data || [],
    })
  } catch (error: unknown) {
    console.error("History API error:", error)
    return NextResponse.json(
      { isConfigured: true, history: [], error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
