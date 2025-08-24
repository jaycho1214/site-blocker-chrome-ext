import type { PlasmoCSConfig } from "plasmo"

import { WARNING_TEMPLATES } from "~lib/warning-templates"
import { storage } from "~storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

interface BlockAction {
  type: "redirect" | "close" | "warning"
  redirectUrl?: string
  warningTemplate?: string
}

async function main() {
  const href = decodeURIComponent(window.location.href)

  // Skip blocking for browser internal URLs
  if (
    href.includes("chrome://") ||
    href.includes("chrome-extension://") ||
    href.includes("moz-extension://") ||
    href.includes("about:") ||
    href === "about:blank" ||
    href === "" ||
    !href.startsWith("http")
  ) {
    return
  }

  const data = await storage.getMany(["site.block.list", "site.block.action"])
  const blockLists: string[] = data["site.block.list"] || []
  const blockAction: BlockAction = data["site.block.action"] || {
    type: "redirect",
    redirectUrl: "https://google.com",
    warningTemplate: "minimal"
  }

  if (blockLists.length === 0) {
    return
  }

  const hostname = window.location.hostname
  const mustBlocked = blockLists.some((blockedUrl) => {
    // If blocked URL starts with http, it's a full URL - match exactly
    if (blockedUrl.startsWith("http")) {
      return href === blockedUrl || href.startsWith(blockedUrl)
    }
    // Otherwise it's a domain - check if hostname matches
    return (
      hostname === blockedUrl ||
      hostname.endsWith("." + blockedUrl) ||
      blockedUrl.includes(hostname)
    )
  })

  if (mustBlocked) {
    executeBlockAction(blockAction)
  }
}

function executeBlockAction(blockAction: BlockAction) {
  switch (blockAction.type) {
    case "redirect":
      window.location.replace(blockAction.redirectUrl || "https://google.com")
      break
    case "close":
      // Use chrome.runtime API to close the tab
      try {
        chrome.runtime.sendMessage({ action: "closeTab" })
      } catch (error) {
        // Fallback: close window if runtime message fails
        window.close()
      }
      break
    case "warning":
      showWarningPage(
        blockAction.redirectUrl || "https://google.com",
        blockAction.warningTemplate || "minimal"
      )
      break
  }
}

function showWarningPage(continueUrl: string, templateId: string = "minimal") {
  const template = WARNING_TEMPLATES[templateId] || WARNING_TEMPLATES.minimal

  // Stop all scripts and prevent new ones from loading
  document.addEventListener("beforescriptexecute", (e) => e.preventDefault())
  document.addEventListener("DOMContentLoaded", (e) => e.preventDefault())

  // Block all network requests
  if (window.stop) window.stop()

  // Remove all existing content and scripts
  document.head?.remove()
  document.body?.remove()

  // Create a full-screen overlay that blocks everything
  const overlay = document.createElement("div")
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    background: #000000 !important;
    pointer-events: all !important;
    margin: 0 !important;
    padding: 0 !important;
  `

  // Add content to the overlay
  overlay.innerHTML = `
    <style>
      * {
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      #siteblock-warning {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Menlo, Consolas, monospace !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: #000000 !important;
        color: #ffffff !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 2147483647 !important;
        pointer-events: all !important;
      }
      .container {
        max-width: 500px !important;
        margin: 2rem !important;
        padding: 0 !important;
      }
      .header {
        margin-bottom: 1.5rem !important;
        backdrop-filter: blur(12px) !important;
        border-bottom: 1px solid #27272a !important;
        background: rgba(9, 9, 11, 0.8) !important;
      }
      .header-content {
        padding: 0.75rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
      }
      .logo {
        width: 1.25rem !important;
        height: 1.25rem !important;
        border-radius: 0.125rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.75rem !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      .brand {
        font-size: 0.875rem !important;
        font-weight: 600 !important;
      }
      .content {
        border-radius: 0.5rem !important;
        background: #09090b !important;
        border: 1px solid #27272a !important;
      }
      .content-header {
        padding: 0.5rem 0.75rem !important;
        border-bottom: 1px solid #27272a !important;
      }
      .content-title {
        font-size: 0.75rem !important;
        color: #a1a1aa !important;
      }
      .content-body {
        padding: 1.5rem !important;
        text-align: center !important;
      }
      .icon {
        font-size: 3rem !important;
        margin-bottom: 1rem !important;
        display: block !important;
      }
      .title {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        margin-bottom: 0.75rem !important;
        color: #ffffff !important;
      }
      .message {
        font-size: 0.875rem !important;
        margin-bottom: 1.5rem !important;
        line-height: 1.5 !important;
        color: #d4d4d8 !important;
      }
      .url-container {
        border-radius: 0.375rem !important;
        padding: 0.75rem !important;
        margin-bottom: 1.5rem !important;
        background: #18181b !important;
        border: 1px solid #27272a !important;
      }
      .url {
        font-size: 0.75rem !important;
        word-break: break-all !important;
        margin: 0 !important;
        color: #a1a1aa !important;
      }
      .buttons {
        display: flex !important;
        gap: 0.5rem !important;
        justify-content: center !important;
      }
      button {
        padding: 0.5rem 1.5rem !important;
        border: none !important;
        border-radius: 0.375rem !important;
        font-size: 0.75rem !important;
        font-family: inherit !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .btn-primary {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .btn-primary:hover {
        background: #e4e4e7 !important;
      }
      .btn-secondary {
        background: #27272a !important;
        color: #d4d4d8 !important;
      }
      .btn-secondary:hover {
        background: #3f3f46 !important;
      }
      .footer {
        text-align: center !important;
        margin-top: 1rem !important;
        font-size: 0.625rem !important;
        color: #71717a !important;
      }
      @media (max-width: 640px) {
        .container {
          margin: 1rem !important;
        }
        .content-body {
          padding: 1rem !important;
        }
        .buttons {
          flex-direction: column !important;
        }
        button {
          width: 100% !important;
        }
      }
    </style>
    <div id="siteblock-warning">
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-icon lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></div>
            <div class="brand">siteblock</div>
          </div>
        </div>
        
        <div class="content">
          <div class="content-header">
            <div class="content-title">blocked site</div>
          </div>
          <div class="content-body">
            <div class="icon">${template.icon}</div>
            <div class="title">${template.title}</div>
            <div class="message">${template.message}</div>
            
            <div class="url-container">
              <div class="url">${window.location.href}</div>
            </div>
            
            <div class="buttons">
              <button class="btn-secondary" onclick="history.back()">go back</button>
              <button class="btn-primary" onclick="window.location.href='${continueUrl}'">continue to ${new URL(continueUrl).hostname}</button>
            </div>
          </div>
        </div>
        
        <div class="footer">
          privacy-first • open source • local storage
        </div>
      </div>
    </div>
  `

  // Replace entire document with just our overlay
  document.documentElement.innerHTML = ""
  document.documentElement.appendChild(overlay)

  // Block any attempts to modify the page
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.target !== overlay &&
        !overlay.contains(mutation.target as Node)
      ) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element && node !== overlay) {
            node.remove()
          }
        })
      }
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  // Block popups and new windows
  window.open = () => null
  window.alert = () => {}
  window.confirm = () => false
  window.prompt = () => null

  // Prevent navigation except through our buttons
  window.addEventListener("beforeunload", (e) => {
    e.preventDefault()
    return false
  })

  // Block iframes and embeds
  const blockElements = document.querySelectorAll(
    "iframe, embed, object, video, audio"
  )
  blockElements.forEach((el) => el.remove())

  // Continuously monitor and block new popups/overlays
  setInterval(() => {
    // Remove any new iframes or popups that might appear
    document
      .querySelectorAll(
        "iframe, embed, object, div[style*='position: fixed'], div[style*='z-index']"
      )
      .forEach((el) => {
        if (!overlay.contains(el)) {
          el.remove()
        }
      })

    // Ensure our overlay stays on top
    if (!document.body.contains(overlay)) {
      document.body.appendChild(overlay)
    }
  }, 100)
}

main()
