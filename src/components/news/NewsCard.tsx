"use client"

import * as React from "react"
import { ExternalLink, Bookmark, Share2, Check, Clock, Newspaper } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewsItem } from "@/types/news"

interface NewsCardProps {
  item: NewsItem
  isBookmarked: boolean
  onToggleBookmark: (item: NewsItem) => void
  viewMode: "grid" | "list"
}

// 시간 포맷팅 헬퍼 (상대 시간)
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

export function NewsCard({
  item,
  isBookmarked,
  onToggleBookmark,
  viewMode,
}: NewsCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = item.link || item.originallink
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  // HTML 태그 하이라이트 렌더러
  const renderHighlighted = (htmlText: string) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlText }} />
  }

  if (viewMode === "list") {
    return (
      <div className="group flex flex-col sm:flex-row items-start justify-between gap-4 rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex-1 space-y-2">
          {/* Meta header */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="press" className="font-medium">
              {item.press}
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatPubDate(item.pubDate)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            <a
              href={item.link || item.originallink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {renderHighlighted(item.title)}
            </a>
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {renderHighlighted(item.description)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleBookmark(item)}
            className={`h-9 w-9 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:text-amber-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={isBookmarked ? "스크랩 취소" : "스크랩 보관"}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="기사 링크 복사"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-2.5 rounded-lg text-xs gap-1"
          >
            <a
              href={item.link || item.originallink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>원문</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    )
  }

  // Grid Mode Card
  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border/60 transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="press" className="font-medium">
            {item.press}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatPubDate(item.pubDate)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
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
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {renderHighlighted(item.description)}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/20 p-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleBookmark(item)}
            className={`h-8 w-8 rounded-md transition-colors cursor-pointer ${
              isBookmarked
                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:text-amber-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={isBookmarked ? "스크랩 취소" : "스크랩 보관"}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            title="기사 링크 복사"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {item.link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-2.5 rounded-md text-xs gap-1 hover:bg-[#03c75a]/10 hover:text-[#03c75a] hover:border-[#03c75a]/30"
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>네이버뉴스</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}

          {item.originallink && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground"
            >
              <a
                href={item.originallink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>원문보기</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
