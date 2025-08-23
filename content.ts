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

  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${template.title} - siteblock</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Menlo, Consolas, monospace;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
            color: #ffffff;
          }
          .container {
            max-width: 500px;
            margin: 2rem;
            padding: 0;
          }
          .header {
            margin-bottom: 1.5rem;
            backdrop-filter: blur(12px);
            border-bottom: 1px solid #27272a;
            background: rgba(9, 9, 11, 0.8);
          }
          .header-content {
            padding: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .logo {
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 0.125rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            background: #ffffff;
            color: #000000;
          }
          .brand {
            font-size: 0.875rem;
            font-weight: 600;
          }
          .content {
            border-radius: 0.5rem;
            background: #09090b;
            border: 1px solid #27272a;
          }
          .content-header {
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #27272a;
          }
          .content-title {
            font-size: 0.75rem;
            color: #a1a1aa;
          }
          .content-body {
            padding: 1.5rem;
            text-align: center;
          }
          .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
          }
          .title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #ffffff;
          }
          .message {
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
            line-height: 1.5;
            color: #d4d4d8;
          }
          .url-container {
            border-radius: 0.375rem;
            padding: 0.75rem;
            margin-bottom: 1.5rem;
            background: #18181b;
            border: 1px solid #27272a;
          }
          .url {
            font-size: 0.75rem;
            word-break: break-all;
            margin: 0;
            color: #a1a1aa;
          }
          .buttons {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
          }
          button {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn-primary {
            background: #ffffff;
            color: #000000;
          }
          .btn-primary:hover {
            background: #e4e4e7;
          }
          .btn-secondary {
            background: #27272a;
            color: #d4d4d8;
          }
          .btn-secondary:hover {
            background: #3f3f46;
          }
          .footer {
            text-align: center;
            margin-top: 1rem;
            font-size: 0.625rem;
            color: #71717a;
          }
          @media (max-width: 640px) {
            .container {
              margin: 1rem;
            }
            .content-body {
              padding: 1rem;
            }
            .buttons {
              flex-direction: column;
            }
            button {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
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
      </body>
    </html>
  `
}

main()
