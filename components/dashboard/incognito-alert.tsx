import { AlertTriangle, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

export function IncognitoAlert() {
  const [hasIncognitoAccess, setHasIncognitoAccess] = useState<boolean | null>(
    null
  )

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

  // Don't show anything while checking or if access is granted
  if (hasIncognitoAccess === null || hasIncognitoAccess === true) {
    return null
  }

  const openExtensionSettings = () => {
    chrome.tabs.create({
      url: `chrome://extensions/?id=${chrome.runtime.id}`
    })
  }

  return (
    <div className="bg-amber-950/50 border border-amber-800 rounded p-3 mb-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-mono text-amber-300 mb-1">
            Incognito mode not enabled
          </div>
          <div className="text-xs font-mono text-amber-200/80 mb-3">
            Site blocking won't work in incognito windows. Enable incognito
            access to protect all browsing sessions.
          </div>
          <button
            onClick={openExtensionSettings}
            className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-amber-700 transition-all">
            <ExternalLink className="w-3 h-3" />
            Enable incognito access
          </button>
        </div>
      </div>
    </div>
  )
}
