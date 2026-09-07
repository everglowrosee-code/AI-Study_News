"use client"

import * as React from "react"
import { Newspaper, KeyRound, Moon, Sun, Sparkles, CheckCircle2, AlertCircle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type DashboardTab = "all" | "saved" | "permanent" | "bookmarks"

interface HeaderProps {
  isMock: boolean
  hasCustomKey: boolean
  onOpenSettings: () => void
  onOpenHistory: () => void
  totalBookmarks: number
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

export function Header({
  isMock,
  hasCustomKey,
  onOpenSettings,
  onOpenHistory,
  totalBookmarks,
  activeTab,
  onTabChange,
}: HeaderProps) {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // 테마 초기화
    const isDarkMode = document.documentElement.classList.contains("dark") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 text-white shadow-md shadow-emerald-500/20">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
                news-capt
              </span>
              <span className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline-block">
                Dashboard
              </span>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              네이버 실시간 뉴스 검색 & 수파베이스 저장소
            </p>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 text-xs sm:text-sm overflow-x-auto">
          <button
            onClick={() => onTabChange("all")}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            실시간 피드
          </button>
          <button
            onClick={() => onTabChange("saved")}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "saved"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            DB 저장 기사
          </button>
          <button
            onClick={() => onTabChange("permanent")}
            className={`cursor-pointer flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "permanent"
                ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>⭐ 영구 보관함</span>
          </button>
          <button
            onClick={() => onTabChange("bookmarks")}
            className={`cursor-pointer hidden md:flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "bookmarks"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>스크랩</span>
            {totalBookmarks > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalBookmarks}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions: API Status, Settings, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Status Badge */}
          <button
            onClick={onOpenSettings}
            className="cursor-pointer group flex items-center gap-1.5 text-xs"
            title="API 연동 상태 확인 및 설정"
          >
            {hasCustomKey && !isMock ? (
              <Badge variant="naver" className="gap-1 shadow-xs transition-transform group-hover:scale-105">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline font-semibold">네이버 API 실시간 연동</span>
                <span className="md:hidden">Live</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 border border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 shadow-xs transition-transform group-hover:scale-105">
                <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline">스마트 데모 모드</span>
                <span className="md:hidden">Demo</span>
              </Badge>
            )}
          </button>

          {/* DB History Modal Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DB 최근기록</span>
          </Button>

          {/* Settings Modal Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="gap-1.5 text-xs font-medium"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API 설정</span>
          </Button>

          {/* Dark / Light Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="테마 전환"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
