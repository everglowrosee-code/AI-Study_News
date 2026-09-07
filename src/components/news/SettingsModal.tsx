"use client"

import * as React from "react"
import { KeyRound, ExternalLink, ShieldCheck, Check, Trash2, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveCredentials: (id: string, secret: string) => void
  onClearCredentials: () => void
  initialClientId: string
  initialClientSecret: string
  isMock: boolean
}

export function SettingsModal({
  isOpen,
  onClose,
  onSaveCredentials,
  onClearCredentials,
  initialClientId,
  initialClientSecret,
  isMock,
}: SettingsModalProps) {
  const [clientId, setClientId] = React.useState(initialClientId)
  const [clientSecret, setClientSecret] = React.useState(initialClientSecret)
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  React.useEffect(() => {
    setClientId(initialClientId)
    setClientSecret(initialClientSecret)
  }, [initialClientId, initialClientSecret, isOpen])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveCredentials(clientId.trim(), clientSecret.trim())
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 800)
  }

  const handleReset = () => {
    setClientId("")
    setClientSecret("")
    onClearCredentials()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">네이버 Open API 설정</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-xs leading-relaxed">
            네이버 검색 오픈API의 Client ID와 Client Secret을 입력하시면 실시간 네이버 뉴스 검색과 연결됩니다.
          </DialogDescription>
        </DialogHeader>

        {/* Demo Mode Notice */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Info className="h-4 w-4 text-foreground" />
            <span>키가 없으신가요?</span>
          </div>
          <p>
            API 키를 등록하지 않아도 <strong>스마트 데모 모드</strong>가 작동하여 모든 대시보드 기능을 자유롭게 사용해보실 수 있습니다.
          </p>
          <a
            href="https://developers.naver.com/apps/#/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 pt-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            <span>네이버 개발자 센터에서 키 무료 발급받기</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Client ID
            </label>
            <Input
              placeholder="예: 2mXJ3kL9oPq..."
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Client Secret
            </label>
            <Input
              type="password"
              placeholder="예: WxYz123456..."
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="h-10 text-sm font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-foreground" />
            <span>키 정보는 브라우저 로컬 스토리지에만 안전하게 보관됩니다.</span>
          </div>

          <DialogFooter className="pt-3 gap-2">
            {(clientId || clientSecret) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>키 초기화</span>
              </Button>
            )}
            <Button
              type="submit"
              disabled={!clientId.trim() || !clientSecret.trim()}
              className="w-full sm:w-auto text-xs font-medium gap-1"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>저장 완료</span>
                </>
              ) : (
                <span>설정 저장 및 적용</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
