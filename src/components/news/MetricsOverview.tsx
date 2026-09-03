"use client"

import * as React from "react"
import { BarChart3, Newspaper, Clock, Bookmark, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewsItem } from "@/types/news"

interface MetricsOverviewProps {
  total: number
  query: string
  items: NewsItem[]
  lastBuildDate?: string
  bookmarkCount: number
  selectedPressFilter: string | null
  onSelectPressFilter: (press: string | null) => void
}

export function MetricsOverview({
  total,
  query,
  items,
  lastBuildDate,
  bookmarkCount,
  selectedPressFilter,
  onSelectPressFilter,
}: MetricsOverviewProps) {
  // 언론사별 기사 개수 집계
  const pressStats = React.useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach((item) => {
      counts[item.press] = (counts[item.press] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // 상위 5개
  }, [items])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Hits */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-primary/5 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">총 검색 결과</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">건 발견</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            키워드: <strong className="text-foreground">"{query}"</strong>
          </p>
        </CardContent>
      </Card>

      {/* 2. Top Press Filter */}
      <Card className="border-border/60 bg-gradient-to-br from-card to-emerald-500/5 hover:shadow-md transition-shadow lg:col-span-2">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">상위 언론사 분포 (필터링 가능)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectPressFilter(null)}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                selectedPressFilter === null
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              전체 언론사
            </button>
            {pressStats.map(([press, count]) => {
              const isSelected = selectedPressFilter === press
              return (
                <button
                  key={press}
                  onClick={() => onSelectPressFilter(isSelected ? null : press)}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "bg-muted/80 text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{press}</span>
                  <span className="rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px] font-bold">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          {selectedPressFilter && (
            <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
              현재 <strong>{selectedPressFilter}</strong> 기사만 필터링되어 표시됩니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3. Bookmarked Articles */}
      <Card className="border-border/60 bg-gradient-to-br from-card to-indigo-500/5 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">스크랩 보관함</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {bookmarkCount}
            </span>
            <span className="text-xs text-muted-foreground">건 저장됨</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {bookmarkCount > 0 ? "보관함 탭에서 확인 가능" : "관심 기사를 북마크해보세요"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
