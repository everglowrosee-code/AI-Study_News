"use client"

import * as React from "react"
import { AlertTriangle, Trash2, ShieldCheck, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteHistoryConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  keyword: string
  searchDate: string
  itemCount: number
  onConfirm: (deleteRelatedItems: boolean) => Promise<void>
}

export function DeleteHistoryConfirmDialog({
  isOpen,
  onClose,
  keyword,
  searchDate,
  itemCount,
  onConfirm,
}: DeleteHistoryConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleAction = async (deleteRelatedItems: boolean) => {
    setIsDeleting(true)
    try {
      await onConfirm(deleteRelatedItems)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">검색 히스토리 삭제</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                검색어: <strong className="text-foreground">"{keyword}"</strong> (검색일시: {searchDate})
              </p>
            </div>
          </div>
          <DialogDescription className="pt-3 text-xs leading-relaxed text-foreground font-medium">
            해당 검색어와 연결된 <span className="text-destructive font-bold">{itemCount}건</span>의 검색결과 기사 리스트를 어떻게 처리하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        {/* Info Box */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>영구 저장 기사 보존 안내</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            '연관 기사 모두 삭제'를 선택하더라도, <strong>⭐ 영구 보관함</strong>에 별도로 저장해 둔 기사는 절대 삭제되지 않고 안전하게 유지됩니다.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Option 1: 연관 기사까지 모두 삭제 */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleAction(true)}
            className="w-full text-left p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" />
                연결된 모든 검색결과 기사도 함께 삭제
              </span>
              <span className="text-[11px] text-destructive/80 font-medium">권장</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              검색 히스토리와 이 검색으로 수집된 기사 {itemCount}건을 데이터베이스에서 일괄 삭제합니다.
            </p>
          </button>

          {/* Option 2: 연관 기사는 영구보관함으로 승격 보존 */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleAction(false)}
            className="w-full text-left p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                검색어만 삭제하고, 기사는 영구 보관함에 유지
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              검색 이력만 삭제하고, 연관 기사들을 영구 보관함으로 옮겨 계속 읽을 수 있도록 보존합니다.
            </p>
          </button>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
