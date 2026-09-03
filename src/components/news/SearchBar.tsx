"use client"

import * as React from "react"
import { Search, RotateCcw, TrendingUp, SlidersHorizontal, LayoutGrid, List, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const SUGGESTED_KEYWORDS = [
  "인공지능",
  "생성형 AI",
  "반도체",
  "로봇",
  "자율주행",
  "스타트업",
  "빅테크",
]

interface SearchBarProps {
  currentQuery: string
  currentSort: "sim" | "date"
  currentDisplay: number
  viewMode: "grid" | "list"
  onSearch: (query: string) => void
  onSortChange: (sort: "sim" | "date") => void
  onDisplayChange: (display: number) => void
  onViewModeChange: (mode: "grid" | "list") => void
  isLoading: boolean
}

export function SearchBar({
  currentQuery,
  currentSort,
  currentDisplay,
  viewMode,
  onSearch,
  onSortChange,
  onDisplayChange,
  onViewModeChange,
  isLoading,
}: SearchBarProps) {
  const [inputValue, setInputValue] = React.useState(currentQuery)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])

  React.useEffect(() => {
    setInputValue(currentQuery)
    // 로컬 스토리지에서 최근 검색어 불러오기
    try {
      const saved = localStorage.getItem("news_capt_recents")
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [currentQuery])

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return
    const updated = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 6)
    setRecentSearches(updated)
    try {
      localStorage.setItem("news_capt_recents", JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      saveRecentSearch(inputValue.trim())
      onSearch(inputValue.trim())
    }
  }

  const handleKeywordClick = (keyword: string) => {
    setInputValue(keyword)
    saveRecentSearch(keyword)
    onSearch(keyword)
  }

  const handleClearRecents = () => {
    setRecentSearches([])
    localStorage.removeItem("news_capt_recents")
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="뉴스 키워드, 기업명, 인물, 정책을 검색해보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-12 pl-11 pr-24 text-base shadow-xs transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl bg-card"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
            >
              지우기
            </button>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 px-6 rounded-xl font-semibold gap-2 shadow-md"
        >
          {isLoading ? (
            <RotateCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>검색</span>
        </Button>
      </form>

      {/* Suggested Keywords & Recents */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-xs">
        {/* Trending Keywords */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-muted-foreground font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            추천:
          </span>
          {SUGGESTED_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => handleKeywordClick(kw)}
              className={`cursor-pointer rounded-full px-2.5 py-1 transition-all ${
                currentQuery === kw
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-muted-foreground shrink-0">최근:</span>
            {recentSearches.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleKeywordClick(kw)}
                className="cursor-pointer shrink-0 rounded-md bg-secondary/80 px-2 py-0.5 text-secondary-foreground hover:bg-secondary"
              >
                {kw}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearRecents}
              className="cursor-pointer text-[11px] text-muted-foreground hover:text-destructive shrink-0 underline ml-1"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar: Sort, Display count, Grid/List view */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border/50 py-3 text-sm">
        {/* Sort & Count */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center rounded-lg bg-muted p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onSortChange("sim")}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-all ${
                currentSort === "sim"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              정확도순
            </button>
            <button
              type="button"
              onClick={() => onSortChange("date")}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-all ${
                currentSort === "date"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              최신순
            </button>
          </div>

          {/* Display Count Select */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>표시:</span>
            {[10, 20, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onDisplayChange(num)}
                className={`cursor-pointer px-2 py-1 rounded transition-colors ${
                  currentDisplay === num
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {num}개
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`cursor-pointer p-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="카드 그리드 뷰"
            aria-label="카드 그리드 뷰"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`cursor-pointer p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="리스트 뷰"
            aria-label="리스트 뷰"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
