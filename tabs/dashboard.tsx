import { Settings, Shield, Zap } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

import { BlockActions } from "~components/dashboard/block-actions"
import { BlockList } from "~components/dashboard/block-list"
import { IncognitoAlert } from "~components/dashboard/incognito-alert"
import { SettingsPage } from "~components/dashboard/settings-page"
import { SiteDeletionDialog } from "~components/dashboard/site-deletion-dialog"
import { Toaster } from "~components/ui/sonner"

import "~globals.css"

import { useStorage } from "@plasmohq/storage/hook"

interface BlockAction {
  type: "redirect" | "close" | "warning"
  redirectUrl?: string
  warningTemplate?: string
}

const tabs = [
  { id: "blocklists", label: "Blocks", icon: Shield },
  { id: "actions", label: "Rules", icon: Zap },
  { id: "settings", label: "Config", icon: Settings }
]

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("blocklists")
  const [blockLists, setBlockLists] = useStorage<string[]>(
    "site.block.list",
    []
  )
  const [siteTimestamps, setSiteTimestamps] = useStorage<
    Record<string, number>
  >("site.block.timestamps", {})
  const [blockAction, setBlockAction] = useStorage<BlockAction>(
    "site.block.action",
    {
      type: "redirect",
      redirectUrl: "https://google.com",
      warningTemplate: "minimal"
    }
  )
  const [deletionDelay] = useStorage<boolean>(
    "site.block.deletion.delay",
    false
  )
  const [pendingDeletions, setPendingDeletions] = useStorage<
    Record<string, number>
  >("site.block.pending.deletions", {})
  const [isDebugMode] = useStorage<boolean>("site.block.debug.mode", false)
  const [newUrl, setNewUrl] = useState("")
  const [showDeletionDialog, setShowDeletionDialog] = useState(false)
  const [deletionDialogData, setDeletionDialogData] = useState<{
    siteName: string
    action: "schedule" | "waiting" | null
    timeLeft: number
    isWithinGracePeriod?: boolean
    gracePeriodLeft?: number
  }>({ siteName: "", action: null, timeLeft: 0 })

  const normalizeUrl = (url: string) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
      return parsed.hostname
    } catch {
      return url
    }
  }

  const addUrl = useCallback(() => {
    if (!newUrl.trim()) return

    const trimmedUrl = newUrl.trim()
    const normalizedUrl = normalizeUrl(trimmedUrl)

    if (blockLists.includes(trimmedUrl)) {
      toast.error("Site already exists", {
        description: `${trimmedUrl} is already in your block list`
      })
      return
    }

    // Check if trying to add redirect URL
    if (blockAction.type === "redirect" && blockAction.redirectUrl) {
      const normalizedRedirectUrl = normalizeUrl(blockAction.redirectUrl)
      if (
        normalizedUrl === normalizedRedirectUrl ||
        trimmedUrl === blockAction.redirectUrl
      ) {
        toast.error("Cannot block redirect URL", {
          description:
            "The redirect destination cannot be added to the block list"
        })
        return
      }
    }

    setBlockLists([...blockLists, trimmedUrl])
    setSiteTimestamps({
      ...siteTimestamps,
      [trimmedUrl]: Date.now()
    })
    setNewUrl("")
  }, [
    newUrl,
    blockLists,
    setBlockLists,
    blockAction,
    siteTimestamps,
    setSiteTimestamps
  ])

  const removeUrl = useCallback(
    (urlToRemove: string) => {
      if (deletionDelay) {
        const now = Date.now()
        const siteCreatedAt = siteTimestamps[urlToRemove]
        const existingPendingTime = pendingDeletions[urlToRemove]

        // Check if site was created within 5 minutes (300,000 ms)
        const gracePeriod = 5 * 60 * 1000
        const isWithinGracePeriod =
          siteCreatedAt && now - siteCreatedAt < gracePeriod

        if (isWithinGracePeriod) {
          // Allow immediate deletion within grace period
          setBlockLists(blockLists.filter((url) => url !== urlToRemove))
          setSiteTimestamps((prev) => {
            const updated = { ...prev }
            delete updated[urlToRemove]
            return updated
          })
          toast.success("Site removed", {
            description: "Removed within 5-minute grace period"
          })
          return
        }

        if (existingPendingTime) {
          const timeLeft = 24 * 60 * 60 * 1000 - (now - existingPendingTime)
          if (timeLeft > 0) {
            setDeletionDialogData({
              siteName: urlToRemove,
              action: "waiting",
              timeLeft
            })
            setShowDeletionDialog(true)
            return
          }
        }

        const gracePeriodLeft = siteCreatedAt
          ? Math.max(0, gracePeriod - (now - siteCreatedAt))
          : 0
        setDeletionDialogData({
          siteName: urlToRemove,
          action: "schedule",
          timeLeft: 0,
          isWithinGracePeriod: false,
          gracePeriodLeft
        })
        setShowDeletionDialog(true)
      } else {
        setBlockLists(blockLists.filter((url) => url !== urlToRemove))
        setSiteTimestamps((prev) => {
          const updated = { ...prev }
          delete updated[urlToRemove]
          return updated
        })
      }
    },
    [
      blockLists,
      setBlockLists,
      deletionDelay,
      pendingDeletions,
      setPendingDeletions,
      siteTimestamps,
      setSiteTimestamps
    ]
  )

  const handleConfirmScheduleDeletion = useCallback(() => {
    const now = Date.now()
    const urlToRemove = deletionDialogData.siteName

    setPendingDeletions({
      ...pendingDeletions,
      [urlToRemove]: now
    })

    setTimeout(
      () => {
        setBlockLists((prev) => prev.filter((url) => url !== urlToRemove))
        setPendingDeletions((prev) => {
          const updated = { ...prev }
          delete updated[urlToRemove]
          return updated
        })
      },
      24 * 60 * 60 * 1000
    )

    setShowDeletionDialog(false)
    toast.success("Site removal scheduled", {
      description: "Site will be removed in 24 hours"
    })
  }, [
    deletionDialogData.siteName,
    pendingDeletions,
    setPendingDeletions,
    setBlockLists
  ])

  const handleCancelWaiting = useCallback(() => {
    const urlToRemove = deletionDialogData.siteName
    setPendingDeletions((prev) => {
      const updated = { ...prev }
      delete updated[urlToRemove]
      return updated
    })
    setShowDeletionDialog(false)
    toast.success("Site removal cancelled")
  }, [deletionDialogData.siteName, setPendingDeletions])

  const handleCancelImmediately = useCallback(() => {
    const urlToRemove = deletionDialogData.siteName
    setPendingDeletions((prev) => {
      const updated = { ...prev }
      delete updated[urlToRemove]
      return updated
    })
    setShowDeletionDialog(false)
    toast.success("Site removal cancelled (debug mode)")
  }, [deletionDialogData.siteName, setPendingDeletions])

  const updateBlockAction = useCallback(
    (
      type: BlockAction["type"],
      redirectUrl?: string,
      warningTemplate?: string
    ) => {
      setBlockAction({ type, redirectUrl, warningTemplate })
    },
    [setBlockAction]
  )

  const renderContent = useMemo(() => {
    switch (activeSection) {
      case "blocklists":
        return (
          <BlockList
            blockLists={blockLists}
            newUrl={newUrl}
            onNewUrlChange={setNewUrl}
            onAddUrl={addUrl}
            onRemoveUrl={removeUrl}
            pendingDeletions={pendingDeletions}
            siteTimestamps={siteTimestamps}
          />
        )
      case "actions":
        return (
          <BlockActions
            blockAction={blockAction}
            onUpdateBlockAction={updateBlockAction}
          />
        )
      case "settings":
        return <SettingsPage blockListsCount={blockLists.length} />
      default:
        return (
          <BlockList
            blockLists={blockLists}
            newUrl={newUrl}
            onNewUrlChange={setNewUrl}
            onAddUrl={addUrl}
            onRemoveUrl={removeUrl}
            pendingDeletions={pendingDeletions}
            siteTimestamps={siteTimestamps}
          />
        )
    }
  }, [
    activeSection,
    blockLists,
    newUrl,
    addUrl,
    removeUrl,
    blockAction,
    updateBlockAction,
    pendingDeletions,
    siteTimestamps
  ])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ultra-minimal header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                <Shield className="w-3 h-3 text-black" />
              </div>
              <span className="font-mono text-sm font-semibold">siteblock</span>
            </div>

            {/* Segment control tabs */}
            <div className="flex items-center bg-zinc-900 rounded-md p-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeSection === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}>
                    <Icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 py-3">
        <IncognitoAlert />
        {renderContent}
      </div>

      <Toaster />

      <SiteDeletionDialog
        open={showDeletionDialog}
        onOpenChange={setShowDeletionDialog}
        siteName={deletionDialogData.siteName}
        action={deletionDialogData.action}
        timeLeft={deletionDialogData.timeLeft}
        isDebugMode={isDebugMode}
        isWithinGracePeriod={deletionDialogData.isWithinGracePeriod}
        gracePeriodLeft={deletionDialogData.gracePeriodLeft}
        onConfirmSchedule={handleConfirmScheduleDeletion}
        onCancelWaiting={handleCancelWaiting}
        onCancelImmediately={handleCancelImmediately}
      />
    </div>
  )
}
