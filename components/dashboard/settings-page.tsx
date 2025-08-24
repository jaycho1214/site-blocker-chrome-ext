import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useStorage } from "@plasmohq/storage/hook"

import packageInfo from "../../package.json"
import { DelayConfirmationDialog } from "./delay-confirmation-dialog"

interface SettingsPageProps {
  blockListsCount: number
}

export function SettingsPage({ blockListsCount }: SettingsPageProps) {
  const [deletionDelay, setDeletionDelay] = useStorage<boolean>(
    "site.block.deletion.delay",
    false
  )
  const [delayToggleTime, setDelayToggleTime] = useStorage<number | null>(
    "site.block.delay.toggle.time",
    null
  )
  const [showDialog, setShowDialog] = useState(false)
  const [dialogAction, setDialogAction] = useState<
    | "enable"
    | "disable-first"
    | "disable-waiting"
    | "disable-ready"
    | "confirm-cancel"
    | null
  >(null)
  const [hasIncognitoAccess, setHasIncognitoAccess] = useState<boolean | null>(
    null
  )
  const [debugMode, setDebugMode] = useStorage<boolean>(
    "site.block.debug.mode",
    false
  )
  const [currentTime, setCurrentTime] = useState(Date.now())

  const handleDelayToggle = () => {
    if (!deletionDelay) {
      // Enabling - show dialog about 24h wait to turn off
      setDialogAction("enable")
      setShowDialog(true)
    } else {
      // User wants to disable - check if they're already in waiting period
      if (delayToggleTime && getTimeLeft() > 0) {
        // Already waiting - show waiting dialog with cancel option
        setDialogAction("disable-waiting")
        setShowDialog(true)
      } else if (delayToggleTime && getTimeLeft() <= 0) {
        // 24 hours have passed - show final confirmation
        setDialogAction("disable-ready")
        setShowDialog(true)
      } else {
        // First time trying to disable - ask for confirmation first
        setDialogAction("disable-first")
        setShowDialog(true)
      }
    }
  }

  const confirmEnable = () => {
    setDeletionDelay(true)
    setDelayToggleTime(null) // No timer when enabling
    setShowDialog(false)
    setDialogAction(null)
    toast.success("Delete delay enabled", {
      description:
        "Sites can be deleted immediately within 5 minutes of creation"
    })
  }

  const confirmStartDisable = () => {
    // Start the 24h countdown
    const newTime = Date.now()
    setDelayToggleTime(newTime)
    setCurrentTime(newTime) // Force immediate UI update
    setShowDialog(false)
    setDialogAction(null)
    toast.success("Countdown started", {
      description: "You can disable delete delay in 24 hours"
    })
  }

  const confirmDisable = () => {
    setDeletionDelay(false)
    setDelayToggleTime(null)
    setShowDialog(false)
    setDialogAction(null)
    toast.success("Delete delay disabled", {
      description: "Sites can now be deleted immediately"
    })
  }

  const requestCancelConfirmation = () => {
    setDialogAction("confirm-cancel")
    // Keep dialog open but change to confirmation view
  }

  const cancelWaiting = () => {
    setDelayToggleTime(null) // Clear the timer - user wants to keep feature enabled
    setCurrentTime(Date.now()) // Force immediate UI update
    setShowDialog(false)
    setDialogAction(null)
    toast.success("Disable cancelled", {
      description: "Delete delay remains enabled"
    })
  }

  const handleRelock = () => {
    setDelayToggleTime(Date.now())
    setShowDialog(false)
    setDialogAction(null)
  }

  const getTimeLeft = () => {
    if (!delayToggleTime) return 0
    const elapsed = Date.now() - delayToggleTime
    const timeLeft = 24 * 60 * 60 * 1000 - elapsed
    return Math.max(0, timeLeft)
  }

  useEffect(() => {
    // Check if extension has incognito access
    const checkIncognitoAccess = () => {
      if (typeof chrome !== "undefined" && chrome.extension) {
        chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
          setHasIncognitoAccess(isAllowed)
        })
      }
    }

    checkIncognitoAccess()
  }, [])

  useEffect(() => {
    // Update current time when there's an active countdown
    if (delayToggleTime && getTimeLeft() > 0) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 10000) // Update every 10 seconds for immediate feedback

      return () => clearInterval(interval)
    }
  }, [delayToggleTime])

  const openExtensionSettings = () => {
    chrome.tabs.create({
      url: `chrome://extensions/?id=${chrome.runtime.id}`
    })
  }

  return (
    <div className="space-y-2">
      {/* Stats */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-400">stats</span>
        </div>

        <div className="grid grid-cols-3 gap-0 text-center">
          <div className="px-2 py-2 border-r border-zinc-900">
            <div className="text-sm font-mono text-white">
              {blockListsCount}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">blocks</div>
          </div>
          <div className="px-2 py-2 border-r border-zinc-900">
            <div className="text-sm font-mono text-white">
              {packageInfo.version}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">version</div>
          </div>
          <div className="px-2 py-2">
            <div className="text-sm font-mono text-green-400">on</div>
            <div className="text-[10px] font-mono text-zinc-500">status</div>
          </div>
        </div>
      </div>

      {/* Protection settings */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-400">protection</span>
        </div>

        <div className="p-1 space-y-1">
          <button
            onClick={() => handleDelayToggle()}
            className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-4 text-center">🕐</span>
              <span>24h delete delay</span>
            </div>
            <div className="flex items-center gap-1">
              {deletionDelay && !delayToggleTime && (
                <span className="text-green-400 text-[10px]">on</span>
              )}
              {deletionDelay && delayToggleTime && getTimeLeft() > 0 && (
                <span className="text-[8px] font-mono text-amber-400 bg-amber-950/50 px-1 rounded">
                  {Math.ceil(getTimeLeft() / (60 * 60 * 1000))}h left
                </span>
              )}
              {deletionDelay && delayToggleTime && getTimeLeft() <= 0 && (
                <span className="text-green-400 text-[10px]">ready</span>
              )}
            </div>
          </button>

          <button
            onClick={openExtensionSettings}
            className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-4 text-center">🕵️</span>
              <span>incognito mode</span>
            </div>
            <div className="flex items-center gap-1">
              {hasIncognitoAccess === true && (
                <span className="text-green-400 text-[10px]">on</span>
              )}
              {hasIncognitoAccess === false && (
                <span className="text-amber-400 text-[10px]">off</span>
              )}
            </div>
          </button>

          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all">
              <div className="flex items-center gap-2">
                <span className="w-4 text-center">🐛</span>
                <span>debug mode</span>
              </div>
              <div className="flex items-center gap-1">
                {debugMode && (
                  <span className="text-amber-400 text-[10px]">on</span>
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Sync status */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-400">chrome sync</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-mono text-green-400">enabled</span>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Links */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-400">links</span>
        </div>
        <div className="p-1 space-y-1">
          <button
            onClick={() =>
              window.open(
                "https://github.com/jaycho1214/site-blocker-chrome-ext",
                "_blank"
              )
            }
            className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all">
            <span>github</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center pt-2">
        <p className="text-[10px] font-mono text-zinc-600">
          privacy-first • open source • local storage
        </p>
      </div>

      <DelayConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        action={dialogAction}
        timeLeft={getTimeLeft()}
        delayToggleTime={delayToggleTime}
        onConfirmEnable={confirmEnable}
        onConfirmStartDisable={confirmStartDisable}
        onConfirmDisable={confirmDisable}
        onCancelWaiting={cancelWaiting}
        onRequestCancelConfirmation={requestCancelConfirmation}
        onRelock={handleRelock}
      />
    </div>
  )
}
