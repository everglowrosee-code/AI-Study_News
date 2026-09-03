"use client"

import * as React from "react"
import { Database, Clock, Search, ExternalLink, RefreshCw, AlertCircle, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HistoryItem {
  id: string
  keyword: string
  total_count: number
  created_at: string
}

interface RecentSearchesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectKeyword: (keyword: string) => void
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "방금 전"
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays === 1) return "어제"
    return `${diffDays}일 전`
  } catch {
    return dateStr
  }
}

export function RecentSearchesModal({
  isOpen,
  onClose,
  onSelectKeyword,
}: RecentSearchesModalProps) {
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [isConfigured, setIsConfigured] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/history")
      const data = await res.json()
      setIsConfigured(data.isConfigured)
      setHistory(data.history || [])
    } catch (err) {
      console.error("Failed to load history:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, fetchHistory])

  const handleItemClick = (keyword: string) => {
    onSelectKeyword(keyword)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl">Supabase 검색 기록 (최근 10개)</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchHistory}
              disabled={isLoading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="새로고침"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <DialogDescription className="pt-1 text-xs">
            수파베이스 DB에 저장된 최근 10개의 뉴스 검색 결과입니다. 클릭 시 즉시 해당 검색어로 이동합니다.
          </DialogDescription>
        </DialogHeader>

        {/* Not Configured Notice */}
        {!isConfigured && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Supabase 환경변수가 필요합니다</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <code>.env.local</code>에 <code>NEXT_PUBLIC_SUPABASE_URL</code>과 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>를 설정하고, <code>supabase/schema.sql</code> 쿼리를 실행하시면 데이터가 자동 동기화됩니다.
            </p>
          </div>
        )}

        {/* History List */}
        <div className="py-2 space-y-2 max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              기록을 불러오는 중...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">저장된 검색 기록이 없습니다.</p>
              <p>뉴스 검색을 수행하면 자동으로 최신 10개가 DB에 기록됩니다.</p>
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleItemClick(item.keyword)}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item.created_at)}
                      </span>
                      {item.total_count > 0 && (
                        <span>• {item.total_count.toLocaleString()}건</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <Search className="h-3.5 w-3.5" />
                  <span className="text-[11px]">검색</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
