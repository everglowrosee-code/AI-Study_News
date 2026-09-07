"use client"

import * as React from "react"
import { ShieldCheck, Trash2, ExternalLink, RefreshCw, Clock, SearchX, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PermanentArticle {
  id: string
  originalNewsId?: string
  title: string
  cleanTitle: string
  originallink: string
  link: string
  description: string
  cleanDescription: string
  pubDate: string
  press: string
  savedAt: string
}

function formatPubDate(pubDateStr: string): string {
  try {
    const date = new Date(pubDateStr)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return pubDateStr
  }
}

export function PermanentNewsView() {
  const [items, setItems] = React.useState<PermanentArticle[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const fetchItems = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/permanent-news")
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error("Failed to load permanent items:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleDeletePermanent = async (id: string) => {
    if (!confirm("영구 보관함에서 이 기사를 삭제하시겠습니까?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/permanent-news?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || "삭제 실패")
      }
    } catch (err) {
      console.error("Delete permanent item error:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const renderHighlighted = (htmlText: string) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />
  }

  return (
    <div className="space-y-6">
      {/* Header & Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-foreground" />
            <span>영구 저장 기사 보관함</span>
            <Badge variant="luxury">ARCHIVE</Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            검색 히스토리가 삭제되거나 10개 제한으로 밀려나더라도 <strong>절대 삭제되지 않고 영구히 보존</strong>되는 독립 보관함입니다.
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
            총 <strong>{items.length}</strong>건 영구 보존
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-4 text-xs text-muted-foreground flex items-center gap-3 shadow-xs">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
        <span className="leading-relaxed">
          이 보관함의 기사들은 독립된 <code>permanent_news</code> 테이블에 저장되어 있어, 검색어 삭제 시 연관 기사가 일괄 삭제되더라도 완벽하게 안전하게 영구 유지됩니다.
        </span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          영구 저장 기사를 불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">영구 저장된 기사가 없습니다.</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            뉴스 피드 또는 [DB 저장 기사]에서 <strong>[영구보관]</strong> 버튼을 누르시면 이곳에 안전하게 보존됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden border border-border/80 bg-card hover:border-foreground/50 hover:shadow-md transition-all"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="press">
                      {item.press}
                    </Badge>
                    <Badge variant="luxury">
                      PERMANENT
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatPubDate(item.pubDate)}</span>
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-bold leading-snug tracking-tight text-foreground group-hover:underline transition-all line-clamp-2">
                  <a
                    href={item.link || item.originallink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderHighlighted(item.title)}
                  </a>
                </h3>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex-1">
                <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
                  {renderHighlighted(item.description)}
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/80 bg-muted/20 p-3.5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === item.id}
                  onClick={() => handleDeletePermanent(item.id)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer gap-1"
                  title="영구 보관함에서 삭제"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>보관 해제</span>
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
