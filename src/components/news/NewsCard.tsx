"use client"

import * as React from "react"
import { ExternalLink, Bookmark, Share2, Check, Clock, Newspaper, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NewsItem } from "@/types/news"

interface NewsCardProps {
  item: NewsItem
  isBookmarked: boolean
  onToggleBookmark: (item: NewsItem) => void
  isPermanent?: boolean
  onTogglePermanent?: (item: NewsItem) => void
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
  isPermanent = false,
  onTogglePermanent,
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
      <div className="group flex flex-col sm:flex-row items-start justify-between gap-4 rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-foreground/50 hover:shadow-md">
        <div className="flex-1 space-y-2">
          {/* Meta header */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="press">
              {item.press}
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
              <Clock className="h-3 w-3" />
              {formatPubDate(item.pubDate)}
            </span>
            {isPermanent && (
              <Badge variant="luxury" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>ARCHIVE</span>
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold leading-snug tracking-tight text-foreground group-hover:underline transition-all line-clamp-2">
            <a
              href={item.link || item.originallink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {renderHighlighted(item.title)}
            </a>
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
            {renderHighlighted(item.description)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
          {onTogglePermanent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePermanent(item)}
              className={`h-8 w-8 rounded-lg transition-colors cursor-pointer ${
                isPermanent
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={isPermanent ? "영구 보관 해제" : "영구 저장소에 보관 (검색어 삭제 시에도 안전)"}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleBookmark(item)}
            className={`h-8 w-8 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={isBookmarked ? "스크랩 취소" : "스크랩 보관"}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            title="기사 링크 복사"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-foreground" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 hover:border-foreground/40 hover:bg-muted"
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
    <Card className="group flex flex-col justify-between overflow-hidden border border-border/80 bg-card transition-all hover:border-foreground/50 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="press">
              {item.press}
            </Badge>
            {isPermanent && (
              <Badge variant="luxury" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
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
        <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-foreground group-hover:underline transition-all line-clamp-2">
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
        <div className="flex items-center gap-1">
          {onTogglePermanent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePermanent(item)}
              className={`h-7 w-7 rounded-md transition-colors cursor-pointer ${
                isPermanent
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={isPermanent ? "영구 보관 해제" : "영구 저장소에 보관"}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleBookmark(item)}
            className={`h-7 w-7 rounded-md transition-colors cursor-pointer ${
              isBookmarked
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={isBookmarked ? "스크랩 취소" : "스크랩 보관"}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            title="기사 링크 복사"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-foreground" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          {item.link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 px-2.5 rounded-md text-[11px] gap-1 border-border/80 hover:border-foreground/40 hover:bg-muted"
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>네이버뉴스</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </Button>
          )}

          {item.originallink && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <a
                href={item.originallink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>원문</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
