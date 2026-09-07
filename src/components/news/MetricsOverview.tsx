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
      <Card className="border border-border/80 bg-card hover:border-foreground/40 transition-all shadow-xs hover:shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              TOTAL ARTICLES
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background shadow-xs">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight font-sans text-foreground">
              {total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-medium">건</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            KEYWORD: <strong className="text-foreground">"{query}"</strong>
          </p>
        </CardContent>
      </Card>

      {/* 2. Top Press Filter */}
      <Card className="border border-border/80 bg-card hover:border-foreground/40 transition-all shadow-xs hover:shadow-sm lg:col-span-2">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              PRESS DISTRIBUTION & FILTER
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectPressFilter(null)}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedPressFilter === null
                  ? "bg-foreground text-background font-bold shadow-xs"
                  : "border border-border/70 bg-card text-foreground/80 hover:border-foreground/30 hover:bg-muted"
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
                  className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                    isSelected
                      ? "bg-foreground text-background font-bold shadow-xs"
                      : "border border-border/70 bg-card text-foreground/80 hover:border-foreground/30 hover:bg-muted"
                  }`}
                >
                  <span>{press}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected
                      ? "bg-background/20 text-background font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          {selectedPressFilter && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              현재 <strong className="text-foreground">'{selectedPressFilter}'</strong> 기사만 필터링되어 표시됩니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3. Bookmarked Articles */}
      <Card className="border border-border/80 bg-card hover:border-foreground/40 transition-all shadow-xs hover:shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              SAVED SCRAPS
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
              <Bookmark className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight font-sans text-foreground">
              {bookmarkCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">건 보관됨</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {bookmarkCount > 0 ? "스크랩 탭에서 열람 가능" : "기사를 북마크해보세요"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
