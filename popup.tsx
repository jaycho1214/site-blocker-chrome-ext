import "~globals.css"

import { ExternalLink, Settings, Shield, ShieldX } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useStorage } from "@plasmohq/storage/hook"

import { Toaster } from "~components/ui/sonner"

interface BlockAction {
  type: "redirect" | "close" | "warning"
  redirectUrl?: string
  warningTemplate?: string
}

export default function IndexPopup() {
  const [tab, setTab] = useState<chrome.tabs.Tab>()
  const [blockLists, setBlockLists] = useStorage<string[]>(
    "site.block.list",
    []
  )
  const [blockAction] = useStorage<BlockAction>("site.block.action", {
    type: "redirect",
    redirectUrl: "https://google.com",
    warningTemplate: "minimal"
  })

  const currentHostname = tab?.url ? new URL(tab.url).hostname : ""
  const currentPageUrl = tab?.url || ""

  const isBlocked = tab?.url
    ? blockLists.some(
        (url) =>
          new URL(tab.url).hostname.includes(url) ||
          url.includes(new URL(tab.url).hostname)
      )
    : false

  const normalizeUrl = (url: string) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
      return parsed.hostname
    } catch {
      return url
    }
  }

  const canBlockUrl = (urlToBlock: string) => {
    if (blockAction.type === "redirect" && blockAction.redirectUrl) {
      const normalizedUrlToBlock = normalizeUrl(urlToBlock)
      const normalizedRedirectUrl = normalizeUrl(blockAction.redirectUrl)

      if (
        normalizedUrlToBlock === normalizedRedirectUrl ||
        urlToBlock === blockAction.redirectUrl
      ) {
        toast.error("Cannot block redirect URL", {
          description: "The redirect destination cannot be blocked"
        })
        return false
      }
    }
    return true
  }

  const blockCurrentPage = () => {
    if (
      currentPageUrl &&
      !blockLists.includes(currentPageUrl) &&
      canBlockUrl(currentPageUrl)
    ) {
      const newBlockLists = [...blockLists, currentPageUrl]
      setBlockLists(newBlockLists)
      // Reload current tab to apply block immediately
      chrome.tabs.reload(tab?.id)
    }
  }

  const blockHostname = () => {
    if (
      currentHostname &&
      !blockLists.includes(currentHostname) &&
      canBlockUrl(currentHostname)
    ) {
      const newBlockLists = [...blockLists, currentHostname]
      setBlockLists(newBlockLists)
      // Reload current tab to apply block immediately
      chrome.tabs.reload(tab?.id)
    }
  }

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }).then(([tab]) => {
      setTab(tab)
    })
  }, [])

  return (
    <div className="w-80 bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                <Shield className="w-3 h-3 text-black" />
              </div>
              <span className="font-mono text-sm font-semibold">siteblock</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  chrome.tabs.create({
                    url: chrome.runtime.getURL("tabs/dashboard.html")
                  })
                }
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-all">
                <Settings className="w-3.5 h-3.5 text-zinc-300" />
              </button>
              <a
                href="https://github.com/jaycho1214/site-blocker-chrome-ext"
                target="_blank"
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-all">
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Current site info */}
        <div className="bg-zinc-950 rounded border border-zinc-800">
          <div className="px-2 py-1 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">
              current site
            </span>
          </div>
          <div className="p-2 space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={tab?.favIconUrl}
                alt="Website favicon"
                className="w-4 h-4 rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-mono text-xs text-white truncate"
                  title={tab?.title}>
                  {tab?.title}
                </div>
                <div
                  className="font-mono text-xs text-zinc-400 truncate"
                  title={currentHostname}>
                  {currentHostname}
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${isBlocked ? "bg-red-400" : "bg-green-400"}`}
              />
            </div>
          </div>
        </div>

        {/* Block status */}
        {isBlocked ? (
          <div className="bg-red-950/50 border border-red-800 rounded p-2 text-center">
            <div className="text-xs font-mono text-red-300">
              site is blocked
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={blockHostname}
              className="w-full flex items-center justify-center gap-2 bg-white text-black px-3 py-2 rounded text-xs font-mono hover:bg-zinc-200 transition-all">
              <Shield className="w-3 h-3" />
              block site
            </button>
            <button
              onClick={blockCurrentPage}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-zinc-300 px-3 py-2 rounded text-xs font-mono hover:bg-zinc-700 transition-all">
              <ShieldX className="w-3 h-3" />
              block page
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="bg-zinc-950 rounded border border-zinc-800">
          <div className="px-2 py-1 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">stats</span>
          </div>
          <div className="px-2 py-1 text-center">
            <div className="text-sm font-mono text-white">
              {blockLists.length}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              blocked sites
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
