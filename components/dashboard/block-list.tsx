import { Plus, X } from "lucide-react"
import { useCallback } from "react"

interface BlockListProps {
  blockLists: string[]
  newUrl: string
  onNewUrlChange: (url: string) => void
  onAddUrl: () => void
  onRemoveUrl: (url: string) => void
  pendingDeletions?: Record<string, number>
  siteTimestamps?: Record<string, number>
}

export function BlockList({
  blockLists,
  newUrl,
  onNewUrlChange,
  onAddUrl,
  onRemoveUrl,
  pendingDeletions = {},
  siteTimestamps = {}
}: BlockListProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        onAddUrl()
      }
    },
    [onAddUrl]
  )

  return (
    <div className="space-y-2">
      {/* Add URL - ultra minimal */}
      <div className="flex items-center gap-1">
        <input
          placeholder="facebook.com"
          value={newUrl}
          onChange={(e) => onNewUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
        />
        <button
          onClick={onAddUrl}
          disabled={!newUrl.trim()}
          className="bg-white text-black px-2 py-1 rounded text-xs font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Sites list - minimal table style */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">blocked sites</span>
          <span className="text-xs font-mono text-zinc-500">
            {blockLists.length}
          </span>
        </div>

        {blockLists.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <span className="text-xs text-zinc-600">no blocks yet</span>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {blockLists.map((url, index) => {
              const isPending = pendingDeletions[url]
              const timeLeft = isPending
                ? 24 * 60 * 60 * 1000 - (Date.now() - isPending)
                : 0
              const hoursLeft =
                isPending && timeLeft > 0
                  ? Math.ceil(timeLeft / (60 * 60 * 1000))
                  : 0

              const siteCreatedAt = siteTimestamps[url]
              const gracePeriod = 5 * 60 * 1000 // 5 minutes
              const gracePeriodLeft = siteCreatedAt
                ? Math.max(0, gracePeriod - (Date.now() - siteCreatedAt))
                : 0
              const isWithinGracePeriod = gracePeriodLeft > 0
              const gracePeriodMinutesLeft = Math.ceil(
                gracePeriodLeft / (60 * 1000)
              )

              return (
                <div
                  key={index}
                  className={`group flex items-center justify-between px-2 py-1 hover:bg-zinc-900/50 border-b border-zinc-900 last:border-0 ${
                    isPending && timeLeft > 0 ? "bg-red-950/20" : ""
                  }`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-600 w-4 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-mono text-xs truncate ${
                        isPending && timeLeft > 0
                          ? "text-red-400"
                          : "text-zinc-300"
                      }`}>
                      {url}
                    </span>
                    {isPending && timeLeft > 0 && (
                      <span className="text-[8px] font-mono text-red-500 bg-red-950/50 px-1 rounded">
                        -{hoursLeft}h
                      </span>
                    )}
                    {isWithinGracePeriod && !isPending && (
                      <span className="text-[8px] font-mono text-green-500 bg-green-950/50 px-1 rounded">
                        {gracePeriodMinutesLeft}m left
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveUrl(url)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition-all">
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
