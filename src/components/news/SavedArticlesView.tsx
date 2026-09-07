"use client"

import * as React from "react"
import { Trash2, ShieldCheck, ExternalLink, RefreshCw, Clock, Newspaper, SearchX, BookOpen, Ban } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SavedNewsItem {
  id: string
  searchId: string
  keyword: string
  title: string
  cleanTitle: string
  originallink: string
  link: string
  description: string
  cleanDescription: string
  articleContent: string | null
  pubDate: string
  press: string
  createdAt: string
}

function formatPubDate(pubDateStr: string): string {
  try {
    const date = new Date(pubDateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "방금 전"
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays === 1) return "어제"
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  } catch {
    return pubDateStr
  }
}

export function SavedArticlesView() {
  const [items, setItems] = React.useState<SavedNewsItem[]>([])
  const [permanentLinks, setPermanentLinks] = React.useState<Set<string>>(new Set())
  const [selectedKeyword, setSelectedKeyword] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = React.useState<SavedNewsItem | null>(null)

  // 1. 저장된 기사 목록 로드
  const fetchItems = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [itemsRes, permRes] = await Promise.all([
        fetch("/api/news-items"),
        fetch("/api/permanent-news"),
      ])
      const itemsData = await itemsRes.json()
      const permData = await permRes.json()

      setItems(itemsData.items || [])
      const pSet = new Set<string>((permData.items || []).map((p: any) => p.link))
      setPermanentLinks(pSet)
    } catch (err) {
      console.error("Failed to load saved items:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // 2. 개별 기사 삭제
  const handleDeleteItem = async (id: string) => {
    if (!confirm("이 기사를 저장 목록에서 삭제하시겠습니까?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/news-items?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || "삭제에 실패했습니다.")
      }
    } catch (err) {
      console.error("Delete item error:", err)
    } finally {
      setDeletingId(null)
    }
  }

  // 3. 영구 저장 토글
  const handleTogglePermanent = async (item: SavedNewsItem) => {
    const isAlreadyPermanent = permanentLinks.has(item.link)
    setSavingId(item.id)
    try {
      if (isAlreadyPermanent) {
        // 영구 보관 해제
        const res = await fetch(`/api/permanent-news?link=${encodeURIComponent(item.link)}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setPermanentLinks((prev) => {
            const next = new Set(prev)
            next.delete(item.link)
            return next
          })
        }
      } else {
        // 영구 보관 등록
        const res = await fetch("/api/permanent-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalNewsId: item.id,
            title: item.title,
            cleanTitle: item.cleanTitle,
            originallink: item.originallink,
            link: item.link,
            description: item.description,
            cleanDescription: item.cleanDescription,
            pubDate: item.pubDate,
            press: item.press,
          }),
        })
        if (res.ok) {
          setPermanentLinks((prev) => new Set(prev).add(item.link))
        }
      }
    } catch (err) {
      console.error("Permanent toggle error:", err)
    } finally {
      setSavingId(null)
    }
  }

  // 키워드 목록 추출
  const keywords = React.useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.keyword) set.add(item.keyword)
    })
    return Array.from(set)
  }, [items])

  const filteredItems = selectedKeyword
    ? items.filter((item) => item.keyword === selectedKeyword)
    : items

  const renderHighlighted = (htmlText: string) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Newspaper className="h-5 w-5 text-foreground" />
            <span>DB 저장 기사 리스트</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            검색 결과로 Supabase <code>news_items</code> 테이블에 저장된 전체 기사입니다. 개별 삭제 및 영구 저장이 가능합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchItems}
            disabled={isLoading}
            className="gap-1.5 text-xs border-border/80 hover:border-foreground/40 hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>새로고침</span>
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            총 <strong>{filteredItems.length}</strong>건
          </span>
        </div>
      </div>

      {/* Keyword Filter Tabs */}
      {keywords.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          <span className="text-muted-foreground shrink-0 font-semibold text-[10px] uppercase tracking-wider">
            FILTER:
          </span>
          <button
            onClick={() => setSelectedKeyword(null)}
            className={`cursor-pointer rounded-lg px-2.5 py-1 transition-all shrink-0 ${
              selectedKeyword === null
                ? "bg-foreground text-background font-bold shadow-xs"
                : "border border-border/70 bg-card text-foreground/80 hover:border-foreground/30 hover:bg-muted"
            }`}
          >
            전체 ({items.length})
          </button>
          {keywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setSelectedKeyword(selectedKeyword === kw ? null : kw)}
              className={`cursor-pointer rounded-lg px-2.5 py-1 transition-all shrink-0 ${
                selectedKeyword === kw
                  ? "bg-foreground text-background font-bold shadow-xs"
                  : "border border-border/70 bg-card text-foreground/80 hover:border-foreground/30 hover:bg-muted"
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          저장된 기사 목록을 불러오는 중...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">저장된 기사가 없습니다.</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            상단 [실시간 피드] 탭에서 뉴스를 검색하시면 자동으로 Supabase에 기사가 저장됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isPermanent = permanentLinks.has(item.link)
            const isCrawlable = (() => {
              try {
                return new URL(item.link).hostname === "n.news.naver.com"
              } catch {
                return false
              }
            })()
            return (
              <Card
                key={item.id}
                onClick={() => isCrawlable && setSelectedArticle(item)}
                className={`group flex flex-col justify-between overflow-hidden border bg-card transition-all hover:shadow-md ${
                  isCrawlable
                    ? "cursor-pointer border-emerald-500/60 ring-1 ring-emerald-500/10 hover:border-emerald-500"
                    : "cursor-default border-border/80 opacity-80"
                }`}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="press">
                        {item.press}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {item.keyword}
                      </Badge>
                      {isCrawlable && (
                        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[9px] font-bold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                          본문 가능
                        </Badge>
                      )}
                      {isPermanent && (
                        <Badge variant="luxury" className="gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          <span>ARCHIVE</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatPubDate(item.pubDate)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug tracking-tight text-foreground transition-all group-hover:underline">
                    {renderHighlighted(item.title)}
                  </h3>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
                    {renderHighlighted(item.description)}
                  </p>
                </CardContent>

                <CardFooter
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center justify-between border-t border-border/80 bg-muted/20 p-3.5"
                >
                  <div className="flex items-center gap-1">
                    {/* 영구 보관 토글 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={savingId === item.id}
                      onClick={() => handleTogglePermanent(item)}
                      className={`h-7 px-2 text-xs rounded-md gap-1 transition-colors cursor-pointer ${
                        isPermanent
                          ? "bg-foreground text-background font-bold hover:bg-foreground/90"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      title={isPermanent ? "영구 보관 해제" : "영구 저장소에 보관"}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      <span>{isPermanent ? "보존됨" : "영구보관"}</span>
                    </Button>

                    {/* 개별 기사 삭제 버튼 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === item.id}
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      title="이 기사 개별 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!isCrawlable}
                      onClick={() => isCrawlable && setSelectedArticle(item)}
                      aria-label={`${item.cleanTitle} 본문 읽기`}
                      title={isCrawlable ? "기사 본문 읽기" : "네이버 뉴스 링크가 아니어서 본문을 읽을 수 없습니다"}
                      className={`h-7 gap-1 px-2 text-[11px] ${
                        isCrawlable
                          ? "text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                          : "cursor-not-allowed text-muted-foreground line-through opacity-45"
                      }`}
                    >
                      {isCrawlable ? <BookOpen className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                      <span>본문 읽기</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 px-2 rounded-md text-[11px] gap-1 border-border/80 hover:border-foreground/40 hover:bg-muted"
                    >
                      <a
                        href={item.link || item.originallink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>원문</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={Boolean(selectedArticle)} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-h-[88vh] overflow-hidden border-zinc-300 bg-white text-zinc-950 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 sm:max-w-3xl">
          {selectedArticle && (
            <>
              <DialogHeader className="border-b border-zinc-200 pb-4 pr-8 dark:border-zinc-800">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="press">{selectedArticle.press}</Badge>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    {selectedArticle.keyword}
                  </Badge>
                </div>
                <DialogTitle className="text-left text-2xl font-extrabold leading-snug text-zinc-950 dark:text-white">
                  {selectedArticle.cleanTitle}
                </DialogTitle>
                <DialogDescription className="text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {formatPubDate(selectedArticle.pubDate)} · 네이버 뉴스 본문
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[58vh] overflow-y-auto rounded-xl bg-zinc-50 p-6 pr-4 dark:bg-zinc-900">
                {selectedArticle.articleContent ? (
                  <p className="mx-auto max-w-[68ch] whitespace-pre-line text-base font-medium leading-8 text-zinc-900 dark:text-zinc-100">
                    {selectedArticle.articleContent}
                  </p>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-center dark:border-zinc-700 dark:bg-zinc-950">
                    <Ban className="mb-3 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-bold">본문 없음</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      네이버 뉴스 링크지만 본문 크롤링에 실패했습니다.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                  <a
                    href={selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    네이버 원문 열기
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
