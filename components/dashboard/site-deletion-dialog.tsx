import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~components/ui/dialog"

interface SiteDeletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteName: string
  action: "schedule" | "waiting" | null
  timeLeft: number
  isDebugMode: boolean
  isWithinGracePeriod?: boolean
  gracePeriodLeft?: number
  onConfirmSchedule: () => void
  onCancelWaiting: () => void
  onCancelImmediately: () => void
}

export function SiteDeletionDialog({
  open,
  onOpenChange,
  siteName,
  action,
  timeLeft,
  isDebugMode,
  isWithinGracePeriod,
  gracePeriodLeft,
  onConfirmSchedule,
  onCancelWaiting,
  onCancelImmediately
}: SiteDeletionDialogProps) {
  const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000))
  const gracePeriodMinutesLeft = gracePeriodLeft
    ? Math.ceil(gracePeriodLeft / (60 * 1000))
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono text-white">
            remove site
          </DialogTitle>
        </DialogHeader>

        {action === "schedule" && (
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono space-y-2">
              <div>
                <span className="text-white">{siteName}</span> will be removed
                in 24 hours due to delete delay protection.
              </div>
              {gracePeriodLeft && gracePeriodLeft > 0 ? (
                <div className="text-amber-300">
                  Note: You missed the 5-minute grace period by{" "}
                  {gracePeriodMinutesLeft} minute
                  {gracePeriodMinutesLeft !== 1 ? "s" : ""}.
                </div>
              ) : (
                <div className="text-zinc-400">
                  Sites can be deleted immediately within 5 minutes of creation.
                </div>
              )}
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onConfirmSchedule}
                className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-red-700 transition-all">
                schedule removal
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                cancel
              </button>
            </DialogFooter>
          </>
        )}

        {action === "waiting" && (
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono">
              <span className="text-white">{siteName}</span> will be removed in{" "}
              {hoursLeft} hours.
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onCancelWaiting}
                className="flex-1 bg-amber-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-amber-700 transition-all">
                cancel waiting
              </button>
              {isDebugMode && (
                <button
                  onClick={onCancelImmediately}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-red-700 transition-all">
                  cancel now
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                close
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
