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
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background shadow-xs">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-foreground font-sans">
                news-capt
              </span>
              <span className="hidden rounded-full border border-border/80 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-muted-foreground sm:inline-block">
                MONO EDITION
              </span>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block tracking-tight">
              실시간 뉴스 인사이트 & Supabase 아카이브
            </p>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 text-xs sm:text-sm overflow-x-auto shadow-xs">
          <button
            onClick={() => onTabChange("all")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            실시간 피드
          </button>
          <button
            onClick={() => onTabChange("saved")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "saved"
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            DB 저장 기사
          </button>
          <button
            onClick={() => onTabChange("permanent")}
            className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "permanent"
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span>영구 보관함</span>
            <span className="text-[10px] opacity-75 font-mono">★</span>
          </button>
          <button
            onClick={() => onTabChange("bookmarks")}
            className={`cursor-pointer hidden md:flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all shrink-0 ${
              activeTab === "bookmarks"
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span>스크랩</span>
            {totalBookmarks > 0 && (
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                activeTab === "bookmarks"
                  ? "bg-background text-foreground"
                  : "bg-foreground text-background"
              }`}>
                {totalBookmarks}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions: API Status, Settings, Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* API Status Badge */}
          <button
            onClick={onOpenSettings}
            className="cursor-pointer group flex items-center gap-1.5 text-xs"
            title="API 연동 상태 확인 및 설정"
          >
            {hasCustomKey && !isMock ? (
              <Badge variant="outline" className="gap-1.5 border-foreground/30 bg-foreground/5 text-foreground shadow-xs transition-transform group-hover:scale-105">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                <span className="hidden md:inline font-semibold">Live 연동됨</span>
                <span className="md:hidden">Live</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 border-dashed border-border/80 text-muted-foreground shadow-xs transition-transform group-hover:scale-105">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                <span className="hidden md:inline">스마트 데모</span>
                <span className="md:hidden">Demo</span>
              </Badge>
            )}
          </button>

          {/* DB History Modal Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="gap-1.5 text-xs font-medium border-border/80 hover:border-foreground/40 hover:bg-muted"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DB 기록</span>
          </Button>

          {/* Settings Modal Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="gap-1.5 text-xs font-medium border-border/80 hover:border-foreground/40 hover:bg-muted"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API 설정</span>
          </Button>

          {/* Dark / Light Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="테마 전환"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
