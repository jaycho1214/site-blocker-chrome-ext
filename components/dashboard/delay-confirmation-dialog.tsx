import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~components/ui/dialog"

interface DelayConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action:
    | "enable"
    | "disable-first"
    | "disable-waiting"
    | "disable-ready"
    | "confirm-cancel"
    | null
  timeLeft: number
  delayToggleTime: number | null
  onConfirmEnable: () => void
  onConfirmStartDisable: () => void
  onConfirmDisable: () => void
  onCancelWaiting: () => void
  onRequestCancelConfirmation: () => void
  onRelock: () => void
}

export function DelayConfirmationDialog({
  open,
  onOpenChange,
  action,
  timeLeft,
  delayToggleTime,
  onConfirmEnable,
  onConfirmStartDisable,
  onConfirmDisable,
  onCancelWaiting,
  onRequestCancelConfirmation,
  onRelock
}: DelayConfirmationDialogProps) {
  const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono text-white">
            24h delete delay
          </DialogTitle>
        </DialogHeader>

        {action === "enable" && (
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono space-y-2">
              <div>
                Once enabled, you must wait 24 hours before turning this feature
                off.
              </div>
              <div className="text-green-300">
                Sites can be deleted immediately within 5 minutes of being
                added.
              </div>
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onConfirmEnable}
                className="flex-1 bg-white text-black px-3 py-1 rounded text-xs font-mono hover:bg-zinc-200 transition-all">
                enable
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                cancel
              </button>
            </DialogFooter>
          </>
        )}

        {action === "disable-first" && (
          // First time trying to disable - ask to start countdown
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono space-y-2">
              <div>
                Are you sure you want to disable the delete delay? You'll need
                to wait 24 hours before it can be fully disabled.
              </div>
              <div className="text-green-300">
                Note: Sites added while this feature is enabled can be removed
                immediately within 5 minutes of creation.
              </div>
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onConfirmStartDisable}
                className="flex-1 bg-amber-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-amber-700 transition-all">
                start countdown
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                cancel
              </button>
            </DialogFooter>
          </>
        )}

        {action === "disable-waiting" && (
          // Already waiting - show countdown and cancel option
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono">
              You must wait {hoursLeft} more hours before disabling this
              feature.
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onRequestCancelConfirmation}
                className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-red-700 transition-all">
                cancel waiting
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                close
              </button>
            </DialogFooter>
          </>
        )}

        {action === "disable-ready" && (
          // 24h passed - can disable now
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono">
              Are you sure you want to disable the 24-hour delete delay?
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onConfirmDisable}
                className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-red-700 transition-all">
                yes, disable
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                cancel
              </button>
            </DialogFooter>
          </>
        )}

        {action === "confirm-cancel" && (
          <>
            <DialogDescription className="text-xs text-zinc-300 font-mono">
              Are you sure you want to cancel disabling this feature? The
              countdown will be cleared and the delete delay will remain
              enabled.
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <button
                onClick={onCancelWaiting}
                className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-green-700 transition-all">
                yes, keep enabled
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
                keep waiting
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
