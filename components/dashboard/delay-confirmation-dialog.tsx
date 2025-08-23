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
  action: "enable" | "disable" | null
  timeLeft: number
  onConfirmEnable: () => void
  onConfirmDisable: () => void
  onCancelWaiting: () => void
  onRelock: () => void
}

export function DelayConfirmationDialog({
  open,
  onOpenChange,
  action,
  timeLeft,
  onConfirmEnable,
  onConfirmDisable,
  onCancelWaiting,
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
            <DialogDescription className="text-xs text-zinc-300 font-mono">
              Once enabled, you must wait 24 hours before turning this feature
              off.
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

        {action === "disable" && (
          <>
            {timeLeft > 0 ? (
              <>
                <DialogDescription className="text-xs text-zinc-300 font-mono">
                  You must wait {hoursLeft} more hours before disabling this
                  feature.
                </DialogDescription>
                <DialogFooter className="flex gap-2">
                  <button
                    onClick={onCancelWaiting}
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
            ) : (
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
                    onClick={onRelock}
                    className="flex-1 bg-white text-black px-3 py-1 rounded text-xs font-mono hover:bg-zinc-200 transition-all">
                    re-lock
                  </button>
                </DialogFooter>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
