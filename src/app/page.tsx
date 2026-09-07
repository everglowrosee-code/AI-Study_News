"use client"

import * as React from "react"
import { Header, DashboardTab } from "@/components/news/Header"
import { SearchBar } from "@/components/news/SearchBar"
import { MetricsOverview } from "@/components/news/MetricsOverview"
import { NewsCard } from "@/components/news/NewsCard"
import { SettingsModal } from "@/components/news/SettingsModal"
import { RecentSearchesModal } from "@/components/news/RecentSearchesModal"
import { SavedArticlesView } from "@/components/news/SavedArticlesView"
import { PermanentNewsView } from "@/components/news/PermanentNewsView"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { NewsItem, NewsResponse, ApiCredentials } from "@/types/news"
import { Sparkles, Bookmark, SearchX, AlertCircle, RefreshCw, KeyRound } from "lucide-react"

export default function NewsDashboardPage() {
  // 상태 관리
  const [query, setQuery] = React.useState("인공지능")
  const [sort, setSort] = React.useState<"sim" | "date">("sim")
  const [display, setDisplay] = React.useState(20)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = React.useState<DashboardTab>("all")
  const [selectedPressFilter, setSelectedPressFilter] = React.useState<string | null>(null)

  const [newsData, setNewsData] = React.useState<NewsResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const [credentials, setCredentials] = React.useState<ApiCredentials>({
    clientId: "",
    clientSecret: "",
  })
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [bookmarks, setBookmarks] = React.useState<NewsItem[]>([])

  // 1. 초기 로컬 스토리지 데이터 불러오기
  React.useEffect(() => {
    try {
      const savedKeys = localStorage.getItem("news_capt_api_keys")
      if (savedKeys) {
        setCredentials(JSON.parse(savedKeys))
      }
      const savedBookmarks = localStorage.getItem("news_capt_bookmarks")
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks))
      }
    } catch {
      // ignore
    }
  }, [])

  // 2. 뉴스 검색 API 호출
  const fetchNews = React.useCallback(
    async (q: string, s: "sim" | "date", d: number, creds: ApiCredentials) => {
      setIsLoading(true)
      setErrorMsg(null)
      try {
        const headers: Record<string, string> = {}
        if (creds.clientId && creds.clientSecret) {
          headers["x-naver-client-id"] = creds.clientId
          headers["x-naver-client-secret"] = creds.clientSecret
        }

        const res = await fetch(
          `/api/news?query=${encodeURIComponent(q)}&sort=${s}&display=${d}`,
          { headers }
        )

        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`)
        }

        const data: NewsResponse = await res.json()
        setNewsData(data)
        if (data.apiError) {
          setErrorMsg(data.apiError)
        }
      } catch (err: unknown) {
        console.error("Failed to fetch news:", err)
        setErrorMsg("뉴스를 불러오는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // 검색 파라미터 또는 인증 정보 변경 시 자동 재검색
  React.useEffect(() => {
    fetchNews(query, sort, display, credentials)
  }, [query, sort, display, credentials, fetchNews])

  // 북마크 토글 헬퍼
  const handleToggleBookmark = (item: NewsItem) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) => (b.link && b.link === item.link) || (b.originallink && b.originallink === item.originallink)
      )
      let next: NewsItem[]
      if (exists) {
        next = prev.filter(
          (b) => (b.link && b.link !== item.link) || (b.originallink && b.originallink !== item.originallink)
        )
      } else {
        next = [item, ...prev]
      }
      try {
        localStorage.setItem("news_capt_bookmarks", JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // API 키 저장 핸들러
  const handleSaveCredentials = (clientId: string, clientSecret: string) => {
    const creds = { clientId, clientSecret }
    setCredentials(creds)
    try {
      localStorage.setItem("news_capt_api_keys", JSON.stringify(creds))
    } catch {
      // ignore
    }
  }

  // API 키 초기화
  const handleClearCredentials = () => {
    setCredentials({ clientId: "", clientSecret: "" })
    try {
      localStorage.removeItem("news_capt_api_keys")
    } catch {
      // ignore
    }
  }

  // 필터링된 기사 목록
  const displayedItems = React.useMemo(() => {
    const baseItems = activeTab === "bookmarks" ? bookmarks : newsData?.items || []
    if (!selectedPressFilter) return baseItems
    return baseItems.filter((item) => item.press === selectedPressFilter)
  }, [activeTab, bookmarks, newsData?.items, selectedPressFilter])

  const isMock = newsData?.isMock ?? false
  const hasCustomKey = Boolean(credentials.clientId && credentials.clientSecret)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header */}
      <Header
        isMock={isMock}
        hasCustomKey={hasCustomKey}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        totalBookmarks={bookmarks.length}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setSelectedPressFilter(null)
        }}
      />

      {/* Main Container */}
      <main className="container mx-auto flex-1 max-w-7xl px-4 py-8 sm:px-8 space-y-8">
        {/* Demo Mode Notice Banner (if using mock) */}
        {isMock && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                    스마트 데모 모드로 작동 중입니다
                  </h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    현재 실시간 네이버 API 키가 등록되지 않아 지능형 데모 뉴스를 보여주고 있습니다. 실시간 뉴스를 원하시면 API 키를 등록해 보세요.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="shrink-0 border-amber-500/30 text-amber-800 hover:bg-amber-500/10 dark:text-amber-300 gap-1 text-xs"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>네이버 API 키 등록하기</span>
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: DB 저장 기사 뷰 */}
        {activeTab === "saved" && <SavedArticlesView />}

        {/* Tab 2: 영구 보관함 뷰 */}
        {activeTab === "permanent" && <PermanentNewsView />}

        {/* Tab 3: 실시간 피드 (검색바 & 통계) */}
        {activeTab === "all" && (
          <>
            <SearchBar
              currentQuery={query}
              currentSort={sort}
              currentDisplay={display}
              viewMode={viewMode}
              onSearch={(q) => {
                setQuery(q)
                setSelectedPressFilter(null)
              }}
              onSortChange={setSort}
              onDisplayChange={setDisplay}
              onViewModeChange={setViewMode}
              isLoading={isLoading}
            />

            {newsData && (
              <MetricsOverview
                total={newsData.total}
                query={query}
                items={newsData.items}
                lastBuildDate={newsData.lastBuildDate}
                bookmarkCount={bookmarks.length}
                selectedPressFilter={selectedPressFilter}
                onSelectPressFilter={setSelectedPressFilter}
              />
            )}
          </>
        )}

        {/* Tab 4: 로컬 스크랩 보관함 헤더 */}
        {activeTab === "bookmarks" && (
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                <span>로컬 스크랩 보관함</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                브라우저 로컬 스토리지에 저장해 둔 임시 스크랩 목록입니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                총 <strong>{bookmarks.length}</strong>개 저장됨
              </span>
            </div>
          </div>
        )}

        {/* News Feed Section (all 및 bookmarks 탭일 때만 렌더링) */}
        {(activeTab === "all" || activeTab === "bookmarks") && (
          <section className="space-y-4">
            {/* Loading Skeletons */}
            {isLoading ? (
              <div
                className={
                  viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              }
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/50 bg-card p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <SearchX className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                {activeTab === "bookmarks"
                  ? "저장된 스크랩 기사가 없습니다."
                  : "검색 결과가 없습니다."}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {activeTab === "bookmarks"
                  ? "뉴스 피드에서 북마크 아이콘을 클릭하여 관심 있는 기사를 저장해보세요."
                  : selectedPressFilter
                  ? `'${selectedPressFilter}' 언론사의 기사가 없습니다. 언론사 필터를 해제해 보세요.`
                  : "다른 검색어를 입력하거나 검색 조건을 변경해 보세요."}
              </p>
              {selectedPressFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPressFilter(null)}
                  className="mt-4 text-xs"
                >
                  언론사 필터 해제
                </Button>
              )}
            </div>
          ) : (
            /* Items List / Grid */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              }
            >
              {displayedItems.map((item, index) => {
                const isBookmarked = bookmarks.some(
                  (b) =>
                    (b.link && b.link === item.link) ||
                    (b.originallink && b.originallink === item.originallink)
                )
                return (
                  <NewsCard
                    key={`${item.link}-${index}`}
                    item={item}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    viewMode={viewMode}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 <strong>news-capt</strong>. Powered by Naver Search Open API.</span>
          <span className="text-[11px]">Next.js 16 App Router & shadcn UI</span>
        </div>
      </footer>

      {/* API Key Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveCredentials={handleSaveCredentials}
        onClearCredentials={handleClearCredentials}
        initialClientId={credentials.clientId}
        initialClientSecret={credentials.clientSecret}
        isMock={isMock}
      />

      {/* Supabase Recent Searches Modal */}
      <RecentSearchesModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectKeyword={(kw) => {
          setQuery(kw)
          setSelectedPressFilter(null)
        }}
      />
    </div>
  )
}
